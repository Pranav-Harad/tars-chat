"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";

export function UserSync() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { isAuthenticated } = useConvexAuth();
    const syncUser = useMutation(api.users.syncUser);
    const updatePresence = useMutation(api.users.updatePresence);

    useEffect(() => {
        if (isLoaded && isSignedIn && user && isAuthenticated) {
            syncUser({
                name: user.fullName ?? user.firstName ?? "Anonymous",
                email: user.primaryEmailAddress?.emailAddress ?? "",
                avatarUrl: user.imageUrl,
            }).catch(console.error);
        }
    }, [isLoaded, isSignedIn, user, syncUser, isAuthenticated]);

    useEffect(() => {
        if (!isSignedIn || !isAuthenticated) return;

        updatePresence().catch(console.error);

        const interval = setInterval(() => {
            updatePresence().catch(console.error);
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [isSignedIn, isAuthenticated, updatePresence]);

    return null;
}
