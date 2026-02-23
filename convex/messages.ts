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

        let reactions = message.reactions || [];
        const existingReactionIndex = reactions.findIndex(r => r.emoji === args.emoji);

        if (existingReactionIndex !== -1) {
            const reaction = reactions[existingReactionIndex];
            const hasReacted = reaction.userIds.includes(user._id);

            if (hasReacted) {
                reaction.userIds = reaction.userIds.filter(id => id !== user._id);
                if (reaction.userIds.length === 0) {
                    reactions.splice(existingReactionIndex, 1);
                }
            } else {
                reaction.userIds.push(user._id);
            }
        } else {
            reactions.push({
                emoji: args.emoji,
                userIds: [user._id],
            });
        }

        await ctx.db.patch(args.messageId, { reactions });
    },
});
