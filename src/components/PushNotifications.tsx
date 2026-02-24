"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

export function PushNotifications() {
    const conversations = useQuery(api.conversations.list);
    const prevConversations = useRef<typeof conversations>(undefined);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Request browser notification permission once loaded
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission();
            }
        }
    }, []);

    useEffect(() => {
        if (conversations === undefined) return;

        if (prevConversations.current === undefined) {
            prevConversations.current = conversations;
            return;
        }

        const prev = prevConversations.current;

        // Find conversations where unreadCount increased 
        // AND the last message is NOT from the current user
        conversations.forEach((conv) => {
            const prevConv = prev.find(p => p._id === conv._id);
            const prevUnreadCount = prevConv?.unreadCount ?? 0;

            if (conv.unreadCount > prevUnreadCount && conv.lastMessage && !conv.lastMessage.isCurrentUser) {
                // Only alert if the user is NOT actively looking at this conversation
                const isCurrentlyViewingChat = pathname === `/chat/${conv._id}`;

                if (!isCurrentlyViewingChat) {
                    // 1. Show In-App Toast
                    const title = conv.displayInfo.name;
                    const text = conv.lastMessage.text;
                    const truncate = (str: string, n: number) => (str.length > n) ? str.slice(0, n - 1) + '...' : str;

                    toast(title, {
                        description: truncate(text, 60),
                        action: {
                            label: "Reply",
                            onClick: () => {
                                router.push(`/chat/${conv._id}`);
                            }
                        }
                    });

                    // 2. Play subtle notification sound (create a gentle beep using AudioContext)
                    try {
                        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                        const audioCtx = new AudioContext();
                        const oscillator = audioCtx.createOscillator();
                        const gainNode = audioCtx.createGain();

                        oscillator.type = 'sine';
                        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
                        oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // Slide up to A6

                        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);

                        oscillator.start(audioCtx.currentTime);
                        oscillator.stop(audioCtx.currentTime + 0.3);
                    } catch (e) { }

                    // 3. Show System Notification if granted
                    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                        new Notification(title, {
                            body: truncate(text, 60),
                            icon: conv.displayInfo.avatarUrl,
                        });
                    }
                }
            }
        });

        prevConversations.current = conversations;
    }, [conversations, pathname, router]);

    return null;
}
