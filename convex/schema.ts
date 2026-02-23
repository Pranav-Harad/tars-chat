import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        avatarUrl: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number(),
    }).index("by_clerkId", ["clerkId"]),

    conversations: defineTable({
        participantIds: v.array(v.id("users")),
        lastMessageId: v.optional(v.id("messages")),
        typingUsers: v.optional(v.array(v.object({
            userId: v.id("users"),
            expiresAt: v.number(),
        }))),
        lastRead: v.optional(v.any()), // Map of userId to last read timestamp
    }),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        text: v.string(),
        isDeleted: v.boolean(),
        reactions: v.optional(v.array(
            v.object({
                emoji: v.string(),
                userIds: v.array(v.id("users")),
            })
        )),
    }).index("by_conversationId", ["conversationId"]),
});
