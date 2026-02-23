"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Send, ArrowDown, Trash2, SmilePlus, Loader2, AlertCircle } from "lucide-react";
import { format, isToday, isThisYear } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

export function ChatArea({
    conversationId,
}: {
    conversationId: Id<"conversations">;
}) {
    const [text, setText] = useState("");
    const messages = useQuery(api.messages.list, { conversationId });
    const sendMessage = useMutation(api.messages.send);
    const deleteMessage = useMutation(api.messages.remove);
    const toggleReaction = useMutation(api.messages.toggleReaction);
    const conversation = useQuery(api.conversations.get, { conversationId });
    const setTypingMutation = useMutation(api.conversations.setTyping);

    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const router = useRouter();

    // Auto-scroll logic
    useEffect(() => {
        if (!isScrolledUp) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isScrolledUp]);

    const markRead = useMutation(api.conversations.markRead);
    useEffect(() => {
        if (messages) {
            markRead({ conversationId }).catch(console.error);
        }
    }, [messages, markRead, conversationId]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        setIsScrolledUp(!isAtBottom);
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!text.trim()) return;

        const messageText = text.trim();
        setIsSending(true);
        setSendError(null);

        try {
            await sendMessage({ conversationId, text: messageText });
            setText("");
            setIsScrolledUp(false); // Force scroll to bottom when sending
        } catch (error) {
            console.error("Failed to send message:", error);
            setSendError("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const formatTimestamp = (ts: number) => {
        const date = new Date(ts);
        if (isToday(date)) return format(date, "h:mm a");
        if (isThisYear(date)) return format(date, "MMM d, h:mm a");
        return format(date, "MMM d, yyyy, h:mm a");
    };

    return (
        <div className="flex flex-col h-full w-full bg-background relative">
            {/* Header */}
            <div className="p-4 border-b bg-card/50 backdrop-blur-md z-10 flex items-center gap-3 shadow-sm sticky top-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0 -ml-2"
                    onClick={() => router.push("/")}
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>{conversation?.isGroup ? "G" : "#"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold text-foreground">
                            {conversation?.isGroup ? conversation.groupName : "Conversation"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {conversation?.isGroup
                                ? `${conversation.participantIds?.length || 0} members`
                                : "Real-time chat"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea
                className="flex-1 p-4"
                onScrollCapture={handleScroll}
                ref={scrollContainerRef}
            >
                <div className="space-y-6 max-w-3xl mx-auto pb-6 pt-4">
                    {messages === undefined ? (
                        <div className="space-y-6">
                            {/* Skeleton loader for messages */}
                            <div className="flex items-end gap-2 flex-row-reverse">
                                <div className="w-8 shrink-0" />
                                <div className="flex flex-col items-end w-full">
                                    <Skeleton className="h-10 w-[60%] rounded-2xl rounded-br-sm" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2 flex-row">
                                <Skeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
                                <div className="flex flex-col items-start w-full gap-1 z-10">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-16 w-[70%] rounded-2xl rounded-bl-sm" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2 flex-row">
                                <div className="w-8 shrink-0" />
                                <div className="flex flex-col items-start w-full">
                                    <Skeleton className="h-10 w-[40%] rounded-2xl rounded-bl-sm" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2 flex-row-reverse">
                                <div className="w-8 shrink-0" />
                                <div className="flex flex-col items-end w-full">
                                    <Skeleton className="h-12 w-[50%] rounded-2xl rounded-br-sm" />
                                </div>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20 opacity-60 fade-in duration-500">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium text-lg mb-1">No messages yet</h3>
                            <p className="text-sm text-muted-foreground">Say hello to start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const showAvatar = i === 0 || messages[i - 1].senderId !== msg.senderId;

                            return (
                                <div
                                    key={msg._id}
                                    className={`flex items-end gap-2 isolate group ${msg.isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    {showAvatar ? (
                                        <Avatar className="h-8 w-8 shrink-0 mb-1 z-10">
                                            <AvatarImage src={msg.senderAvatar} />
                                            <AvatarFallback className="text-xs">{msg.senderName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="w-8 shrink-0" />
                                    )}

                                    <div className={`flex flex-col relative ${msg.isCurrentUser ? "items-end" : "items-start"} max-w-[70%]`}>
                                        {showAvatar && (
                                            <span className="text-[11px] text-muted-foreground font-medium mb-1 px-1">
                                                {msg.senderName}
                                            </span>
                                        )}
                                        <div
                                            className={`relative px-4 py-2.5 rounded-2xl ${msg.isCurrentUser
                                                ? "bg-primary text-primary-foreground rounded-br-sm shadow-md shadow-primary/20"
                                                : "bg-muted/80 text-foreground rounded-bl-sm border border-border/50 shadow-sm"
                                                }`}
                                        >
                                            {msg.isDeleted ? (
                                                <p className="text-[14px] italic opacity-70">This message was deleted</p>
                                            ) : (
                                                <>
                                                    <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                                                    {msg.isCurrentUser && (
                                                        <button
                                                            onClick={() => deleteMessage({ messageId: msg._id })}
                                                            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 rounded-full"
                                                            title="Delete message"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Reaction Picker Trigger */}
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                className={`absolute top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:bg-muted rounded-full ${msg.isCurrentUser ? '-left-16' : '-right-10'}`}
                                                                title="Add Reaction"
                                                            >
                                                                <SmilePlus className="w-4 h-4" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent side="top" align="center" className="w-auto p-1.5 flex gap-1 rounded-full shadow-lg border-border/50">
                                                            {REACTIONS.map((emoji) => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full text-lg transition-colors cursor-pointer"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </PopoverContent>
                                                    </Popover>
                                                </>
                                            )}
                                        </div>

                                        {/* Display Reactions */}
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className={`flex flex-wrap gap-1 mt-1 z-10 ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}>
                                                {msg.reactions.map((r) => (
                                                    <button
                                                        key={r.emoji}
                                                        onClick={() => toggleReaction({ messageId: msg._id, emoji: r.emoji })}
                                                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border bg-background/95 backdrop-blur-sm text-foreground shadow-sm hover:bg-muted transition-colors"
                                                    >
                                                        <span>{r.emoji}</span>
                                                        {r.userIds.length > 1 && <span className="font-medium text-xs opacity-70">{r.userIds.length}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                            {formatTimestamp(msg._creationTime)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Typing Indicator */}
                    {conversation?.typingNames && conversation.typingNames.length > 0 && (
                        <div className="flex flex-row items-end gap-2 isolate fade-in duration-300 mt-2">
                            <div className="w-8 shrink-0" />
                            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-muted/50 text-foreground rounded-bl-sm border border-border/30 w-fit">
                                <span className="text-[13px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                    {conversation.typingNames.join(", ")} is typing
                                </span>
                                <div className="flex gap-0.5 ml-1">
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} className="h-1" />
                </div>
            </ScrollArea>

            {/* Floating button for new messages if scrolled up */}
            {isScrolledUp && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 fade-in zoom-in slide-in-from-bottom-5 duration-200">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full shadow-lg border bg-background/90 backdrop-blur"
                        onClick={() => {
                            setIsScrolledUp(false);
                            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        <ArrowDown className="w-4 h-4 mr-2" /> New messages
                    </Button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-background/80 backdrop-blur-md border-t flex flex-col gap-2">
                {sendError && (
                    <div className="max-w-3xl mx-auto w-full flex items-center justify-between bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg border border-destructive/20 fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>{sendError}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => handleSend()}
                            disabled={isSending}
                        >
                            Retry
                        </Button>
                    </div>
                )}

                <form
                    onSubmit={handleSend}
                    className="max-w-3xl mx-auto w-full flex items-end gap-3"
                >
                    <div className="flex-1 bg-muted/40 border border-muted-foreground/20 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all flex items-center p-1.5 shadow-sm">
                        <Input
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setSendError(null);
                                if (e.target.value.trim() !== "") {
                                    if (!typingTimeoutRef.current) {
                                        setTypingMutation({ conversationId }).catch(console.error);
                                        typingTimeoutRef.current = setTimeout(() => {
                                            typingTimeoutRef.current = null;
                                        }, 2000);
                                    }
                                }
                            }}
                            placeholder="Type a message..."
                            className="border-0 bg-transparent focus-visible:ring-0 px-3 py-6 shadow-none text-[15px] w-full"
                            disabled={isSending}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!text.trim() || isSending}
                            className="h-10 w-10 shrink-0 rounded-xl ml-2 transition-transform active:scale-95"
                        >
                            {isSending ? (
                                <Loader2 className="w-5 h-5 -ml-0.5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 -ml-0.5" />
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
