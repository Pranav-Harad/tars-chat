import { ChatArea } from "@/components/ChatArea";
import { Id } from "../../../../convex/_generated/dataModel";

export default async function ChatPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <ChatArea conversationId={id as Id<"conversations">} />;
}
