"use client";

import { useEffect, useRef } from "react";

const TIPS = [
    { icon: "🔍", text: "Search for a user by name to start a new conversation." },
    { icon: "👥", text: "Click the + button to create a group chat." },
    { icon: "❤️", text: "Hover over a message to react with an emoji." },
    { icon: "🗑️", text: "Hover over your own message to delete it." },
    { icon: "🟢", text: "Green dot means a user is currently online." },
    { icon: "✅", text: "Double checkmark means your message was read." },
    { icon: "💬", text: "Animated dots show when someone is typing." },
];

function FloatingOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Large slow blobs */}
            <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-violet-500/8 dark:bg-violet-400/6 rounded-full blur-[80px] animate-[drift_18s_ease-in-out_infinite]" />
            <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-indigo-500/8 dark:bg-indigo-400/6 rounded-full blur-[90px] animate-[drift_22s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/4 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />
        </div>
    );
}

export function EmptyChatArea() {
    const tipRef = useRef<HTMLDivElement>(null);

    // Rotate tips every 4s
    useEffect(() => {
        let idx = 0;
        const items = tipRef.current?.querySelectorAll("[data-tip]");
        if (!items || items.length === 0) return;

        items[0].classList.remove("opacity-0");
        items[0].classList.add("opacity-100");

        const interval = setInterval(() => {
            items[idx].classList.remove("opacity-100");
            items[idx].classList.add("opacity-0");
            idx = (idx + 1) % items.length;
            items[idx].classList.remove("opacity-0");
            items[idx].classList.add("opacity-100");
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full select-none">
            <FloatingOrbs />

            {/* Central chat bubble graphic */}
            <div className="relative mb-10 flex items-end justify-center gap-2">
                {/* Decorative bubbles */}
                <div className="w-10 h-10 rounded-2xl rounded-bl-sm bg-muted border border-border/60 flex items-center justify-center text-lg shadow-sm animate-[bounce_3s_ease-in-out_infinite] delay-300">
                    👋
                </div>
                <div className="w-16 h-16 rounded-3xl rounded-br-sm bg-primary flex items-center justify-center shadow-xl shadow-primary/20 animate-[bounce_3s_ease-in-out_infinite]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                    </svg>
                </div>
                <div className="w-10 h-10 rounded-2xl rounded-br-sm bg-muted border border-border/60 flex items-center justify-center text-lg shadow-sm animate-[bounce_3s_ease-in-out_infinite] delay-150">
                    ✨
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold tracking-tight mb-2">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-violet-500 to-primary bg-clip-text text-transparent">
                    Pranverse
                </span>
            </h2>
            <p className="text-sm text-muted-foreground mb-10 max-w-xs text-center leading-relaxed">
                Pick a conversation or search for someone new to start messaging in real time.
            </p>

            {/* Rotating tips card */}
            <div className="w-72 relative">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-2 text-center">
                    Quick Tips
                </div>
                <div
                    ref={tipRef}
                    className="relative h-14 bg-card/60 backdrop-blur-md border border-border/60 rounded-2xl shadow-sm overflow-hidden"
                >
                    {TIPS.map((tip, i) => (
                        <div
                            key={i}
                            data-tip
                            className={`absolute inset-0 flex items-center gap-3 px-4 transition-opacity duration-700 ${i === 0 ? "opacity-0" : "opacity-0"}`}
                        >
                            <span className="text-xl shrink-0">{tip.icon}</span>
                            <p className="text-xs text-muted-foreground leading-snug">{tip.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mini stats row */}
            <div className="flex items-center gap-6 mt-10">
                {[
                    { label: "Real-time", icon: "⚡" },
                    { label: "Encrypted", icon: "🔒" },
                    { label: "Group chats", icon: "👥" },
                    { label: "Reactions", icon: "❤️" },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-90 transition-opacity cursor-default">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
