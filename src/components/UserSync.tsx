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
        console.log("UserSync Debug:", { isLoaded, isSignedIn, hasUser: !!user, isAuthenticated });
        if (isLoaded && isSignedIn && user && isAuthenticated) {
            console.log("Calling syncUser for:", user.id);
            syncUser({
                name: user.fullName ?? user.firstName ?? "Anonymous",
                email: user.primaryEmailAddress?.emailAddress ?? "",
                avatarUrl: user.imageUrl,
            }).catch((err) => console.error("syncUser error:", err));
        }
    }, [isLoaded, isSignedIn, user, syncUser, isAuthenticated]);

    useEffect(() => {
        if (!isSignedIn || !isAuthenticated) return;

        updatePresence().catch((err) => console.error("updatePresence error:", err));

        const interval = setInterval(() => {
            updatePresence().catch(console.error);
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [isSignedIn, isAuthenticated, updatePresence]);

    return null;
}
