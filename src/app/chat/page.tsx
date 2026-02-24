import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { EmptyChatArea } from "@/components/EmptyChatArea";

export default async function ChatPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect("/");
    }

    return (
        <main className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 hidden md:flex flex-col h-full relative overflow-hidden">
                <EmptyChatArea />
            </div>
        </main>
    );
}
