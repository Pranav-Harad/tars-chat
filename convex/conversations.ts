import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrGet = mutation({
    args: {
        participantId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!currentUser) {
            throw new Error("Current user not found");
        }

        if (currentUser._id === args.participantId) {
            throw new Error("Cannot message yourself");
        }

        const conversations = await ctx.db.query("conversations").collect();

        const existingConversation = conversations.find(
            (c) =>
                c.participantIds.length === 2 &&
                c.participantIds.includes(currentUser._id) &&
                c.participantIds.includes(args.participantId)
        );

        if (existingConversation) {
            return existingConversation._id;
        }

        const newConversationId = await ctx.db.insert("conversations", {
            participantIds: [currentUser._id, args.participantId],
        });

        return newConversationId;
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        participantIds: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!currentUser) {
            throw new Error("Current user not found");
        }

        // Ensure current user is in the group
        const participantIds = new Set([...args.participantIds, currentUser._id]);

        if (participantIds.size < 2) {
            throw new Error("Group must have at least 2 members");
        }

        const newConversationId = await ctx.db.insert("conversations", {
            participantIds: Array.from(participantIds),
            isGroup: true,
            groupName: args.name,
        });

        return newConversationId;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!currentUser) return [];

        const conversations = await ctx.db.query("conversations").collect();

        // Filter conversations where current user is a participant
        const myConversations = conversations.filter((c) =>
            c.participantIds.includes(currentUser._id)
        );

        // Enrich with other participant and last message details
        const enriched = await Promise.all(
            myConversations.map(async (c) => {
                let displayInfo = { name: "Unknown", avatarUrl: undefined as string | undefined, isOnline: false };

                if (c.isGroup) {
                    displayInfo.name = c.groupName || "Unnamed Group";
                } else {
                    const otherParticipantId = c.participantIds.find(id => id !== currentUser._id);
                    const otherUser = otherParticipantId ? await ctx.db.get(otherParticipantId) : null;
                    if (otherUser) {
                        displayInfo.name = otherUser.name;
                        displayInfo.avatarUrl = otherUser.avatarUrl;
                        displayInfo.isOnline = otherUser.isOnline;
                    }
                }

                let lastMessage = null;
                if (c.lastMessageId) {
                    lastMessage = await ctx.db.get(c.lastMessageId);
                }

                const myLastRead = c.lastRead?.[currentUser._id] || 0;
                const unreadMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) => q.eq("conversationId", c._id))
                    .collect();
                const unreadCount = unreadMessages.filter(
                    m => m.senderId !== currentUser._id && m._creationTime > myLastRead
                ).length;

                return {
                    _id: c._id,
                    isGroup: c.isGroup,
                    memberCount: c.participantIds.length,
                    displayInfo,
                    unreadCount,
                    lastMessage: lastMessage ? {
                        text: lastMessage.text,
                        isCurrentUser: lastMessage.senderId === currentUser._id,
                        createdAt: lastMessage._creationTime,
                    } : null,
                };
            })
        );

        // Sort by most recent message, or creation time if no messages
        return enriched.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt ?? 0;
            const timeB = b.lastMessage?.createdAt ?? 0;
            return timeB - timeA;
        });
    },
});

export const get = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return null;

        const conv = await ctx.db.get(args.conversationId);
        if (!conv) return null;

        // Enrich typing users with names
        const now = Date.now();
        const activeTypingInfo = (conv.typingUsers || []).filter(
            t => t.expiresAt > now && t.userId !== user._id
        );

        const typingDetails = await Promise.all(
            activeTypingInfo.map(async t => {
                const u = await ctx.db.get(t.userId);
                return u?.name ?? "Someone";
            })
        );

        return {
            ...conv,
            typingNames: typingDetails,
        };
    }
});

export const setTyping = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return;

        const conv = await ctx.db.get(args.conversationId);
        if (!conv) return;

        const now = Date.now();
        const expiresAt = now + 3000;

        let typingUsers = conv.typingUsers || [];
        typingUsers = typingUsers.filter(t => t.userId !== user._id && t.expiresAt > now);
        typingUsers.push({ userId: user._id, expiresAt });

        await ctx.db.patch(args.conversationId, { typingUsers });
    },
});

export const markRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return;

        const conv = await ctx.db.get(args.conversationId);
        if (!conv) return;

        const lastRead = conv.lastRead || {};
        lastRead[user._id] = Date.now();

        await ctx.db.patch(args.conversationId, { lastRead });
    }
});
