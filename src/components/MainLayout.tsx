"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

export function MainLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isChatRoute = pathname.startsWith("/chat");

    return (
        <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-background relative">
            <div
                className={`${isChatRoute ? "hidden md:flex" : "flex"
                    } w-full md:w-80 h-full border-r bg-card/50 backdrop-blur-xl shrink-0 z-10`}
            >
                <Sidebar />
            </div>

            <div
                className={`${!isChatRoute ? "hidden md:flex" : "flex"
                    } flex-1 w-full h-full relative`}
            >
                {children}
            </div>
        </div>
    );
}
