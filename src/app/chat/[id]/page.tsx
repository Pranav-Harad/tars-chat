import { ChatArea } from "@/components/ChatArea";
import { Id } from "../../../../convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function ChatPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const { id } = await params;

    return (
        <main className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex w-full h-full relative overflow-hidden">
                <ChatArea conversationId={id as Id<"conversations">} />
            </div>
        </main>
    );
}
