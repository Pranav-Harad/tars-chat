import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        avatarUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called syncUser without authentication present");
        }

        const clerkId = identity.subject;

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
            .first();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                avatarUrl: args.avatarUrl,
                isOnline: true,
                lastSeen: Date.now(),
            });
            return existingUser._id;
        }

        return await ctx.db.insert("users", {
            clerkId,
            name: args.name,
            email: args.email,
            avatarUrl: args.avatarUrl,
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
    },
});

export const getOtherUsers = query({
    args: {
        searchQuery: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        let usersQuery = ctx.db.query("users");
        const allUsers = await usersQuery.collect();

        let others = allUsers.filter((u) => u.clerkId !== identity.subject);

        if (args.searchQuery) {
            const searchLower = args.searchQuery.toLowerCase();
            others = others.filter((u) => u.name.toLowerCase().includes(searchLower));
        }

        return others.map(u => ({
            ...u,
            isOnline: u.lastSeen > Date.now() - 120000,
        }));
    },
});

export const updatePresence = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (user) {
            await ctx.db.patch(user._id, {
                lastSeen: Date.now(),
                isOnline: true
            });
        }
    },
});
