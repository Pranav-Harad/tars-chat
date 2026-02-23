"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function UserSync() {
    const { user, isLoaded, isSignedIn } = useUser();
    const syncUser = useMutation(api.users.syncUser);
    const updatePresence = useMutation(api.users.updatePresence);

    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            syncUser({
                name: user.fullName ?? user.firstName ?? "Anonymous",
                email: user.primaryEmailAddress?.emailAddress ?? "",
                avatarUrl: user.imageUrl,
            }).catch(console.error);
        }
    }, [isLoaded, isSignedIn, user, syncUser]);

    useEffect(() => {
        if (!isSignedIn) return;

        updatePresence().catch(console.error);

        const interval = setInterval(() => {
            updatePresence().catch(console.error);
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [isSignedIn, updatePresence]);

    return null;
}
