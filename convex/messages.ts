import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        // Enrich with sender details
        return await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                return {
                    ...msg,
                    senderName: sender?.name ?? "Unknown",
                    senderAvatar: sender?.avatarUrl,
                    isCurrentUser: sender?.clerkId === identity.subject,
                };
            })
        );
    },
});

export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!currentUser) throw new Error("User not found");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: currentUser._id,
            text: args.text,
            isDeleted: false,
        });

        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
        });

        return messageId;
    },
});

export const remove = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        if (message.senderId !== user._id) {
            throw new Error("Cannot delete someone else's message");
        }

        await ctx.db.patch(args.messageId, { isDeleted: true });
    },
});

export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        // 1. First, completely remove this user from ALL existing reactions
        const cleanReactions = (message.reactions || [])
            .map(r => ({
                ...r,
                userIds: r.userIds.filter(id => id !== user._id)
            }))
            .filter(r => r.userIds.length > 0);

        // 2. Determine if the user was already reacting with THIS specific emoji
        const existingReaction = (message.reactions || []).find(r => r.emoji === args.emoji);
        const wasReactingWithThisEmoji = existingReaction?.userIds.includes(user._id);

        let finalReactions = [...cleanReactions];

        // 3. If they weren't already reacting with this emoji (or if they were reacting with a DIFFERENT emoji), add them to this emoji
        if (!wasReactingWithThisEmoji) {
            const targetEmojiIndex = finalReactions.findIndex(r => r.emoji === args.emoji);
            if (targetEmojiIndex !== -1) {
                finalReactions[targetEmojiIndex].userIds.push(user._id);
            } else {
                finalReactions.push({
                    emoji: args.emoji,
                    userIds: [user._id]
                });
            }
        }

        await ctx.db.patch(args.messageId, { reactions: finalReactions });
    },
});
