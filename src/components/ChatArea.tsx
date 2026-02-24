"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Send, ArrowDown, Trash2, SmilePlus, Loader2, AlertCircle, Check, CheckCheck, LogOut } from "lucide-react";
import { format, isToday, isThisYear } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

// Inline SVG chat wallpaper — WhatsApp-style doodle icons tiling pattern
const WALLPAPER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
  <defs><style>.i{fill:none;stroke:%23888;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round;opacity:0.18;}</style></defs>
  <g transform='translate(10,8)' class='i'><path d='M2 10a8 8 0 1 0 14.5 4.5L18 20l-4-1.8A8 8 0 0 0 2 10z'/><line x1='6' y1='9' x2='12' y2='9'/><line x1='6' y1='12' x2='10' y2='12'/></g>
  <g transform='translate(110,5)' class='i'><path d='M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z'/></g>
  <g transform='translate(55,2)' class='i'><polygon points='12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26'/></g>
  <g transform='translate(168,10)' class='i'><polyline points='13,2 7,13 12,13 11,22 17,11 12,11'/></g>
  <g transform='translate(140,55)' class='i'><path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/></g>
  <g transform='translate(12,70)' class='i'><circle cx='12' cy='12' r='10'/><path d='M8 14s1.5 2 4 2 4-2 4-2'/><line x1='9' y1='9' x2='9.01' y2='9'/><line x1='15' y1='9' x2='15.01' y2='9'/></g>
  <g transform='translate(80,60)' class='i'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></g>
  <g transform='translate(155,75)' class='i'><path d='M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z'/><path d='M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z'/></g>
  <g transform='translate(40,100)' class='i'><path d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'/><path d='m3.29 15 11-11a9 9 0 0 1 7 7l-11 11a7 7 0 0 1-7-7z'/><circle cx='14' cy='10' r='1'/></g>
  <g transform='translate(110,100)' class='i'><circle cx='12' cy='12' r='10'/><path d='M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20'/></g>
  <g transform='translate(170,115)' class='i'><path d='M12 3v4M12 17v4M3 12h4M17 12h4M6.34 6.34l2.83 2.83M14.83 14.83l2.83 2.83M6.34 17.66l2.83-2.83M14.83 9.17l2.83-2.83'/></g>
  <g transform='translate(6,148)' class='i'><line x1='22' y1='2' x2='11' y2='13'/><polygon points='22 2 15 22 11 13 2 9 22 2'/></g>
  <g transform='translate(80,140)' class='i'><path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'/><circle cx='12' cy='13' r='4'/></g>
  <g transform='translate(150,145)' class='i'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></g>
</svg>`;
const WALLPAPER_URL = `url("data:image/svg+xml,${encodeURIComponent(WALLPAPER_SVG)}")`;



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
    const leaveGroup = useMutation(api.conversations.leaveGroup);
    const conversation = useQuery(api.conversations.get, { conversationId });
    const setTypingMutation = useMutation(api.conversations.setTyping);

    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const router = useRouter();

    const handleLeaveGroup = async () => {
        setIsLeaving(true);
        try {
            await leaveGroup({ conversationId });
            router.push("/chat");
        } catch (error) {
            console.error("Failed to leave group:", error);
            setIsLeaving(false);
            setShowLeaveDialog(false);
        }
    };

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

    const getOtherLastRead = () => {
        if (!conversation?.lastRead || !conversation?.currentUserId) return 0;

        // Find the maximum lastRead timestamp among other participants
        const otherReadTimes = Object.entries(conversation.lastRead)
            .filter(([userId]) => userId !== conversation.currentUserId)
            .map(([, timestamp]) => timestamp as number);

        if (otherReadTimes.length === 0) return 0;
        return Math.max(...otherReadTimes);
    };

    const otherLastRead = getOtherLastRead();

    return (
        <div className="flex flex-col h-full w-full bg-background">


            {/* Leave Group Confirmation Dialog */}
            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <DialogContent showCloseButton={false} className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Leave Group?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to leave <strong>{conversation?.displayInfo?.name}</strong>? You won&apos;t receive any more messages from this group.
                    </p>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowLeaveDialog(false)} disabled={isLeaving}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLeaveGroup} disabled={isLeaving}>
                            {isLeaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
                            Leave Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="p-4 border-b bg-card/50 backdrop-blur-md z-10 flex items-center gap-3 shadow-sm sticky top-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0 -ml-2"
                    onClick={() => router.push("/chat")}
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-3 relative flex-1 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={conversation?.displayInfo?.avatarUrl} />
                        <AvatarFallback>{conversation?.isGroup ? "G" : conversation?.displayInfo?.name?.charAt(0) || "#"}</AvatarFallback>
                    </Avatar>
                    {conversation && !conversation.isGroup && conversation.displayInfo?.isOnline && (
                        <span className="absolute bottom-0 left-7 w-3 h-3 bg-green-500 border-2 border-background rounded-full z-10"></span>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-foreground truncate">
                            {conversation?.displayInfo?.name || "Loading..."}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {conversation?.isGroup
                                ? `${conversation.participantIds?.length || 0} members`
                                : conversation?.displayInfo?.isOnline
                                    ? <span className="text-green-600 dark:text-green-500 font-medium">Online</span>
                                    : conversation?.displayInfo?.lastSeen
                                        ? `Last seen ${formatTimestamp(Number(conversation.displayInfo.lastSeen))} `
                                        : "Offline"
                            }
                        </p>
                    </div>
                </div>
                {/* Leave Group button — only for group conversations */}
                {conversation?.isGroup && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Leave Group"
                        onClick={() => setShowLeaveDialog(true)}
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Messages Area */}
            <ScrollArea
                className="flex-1 min-h-0 p-4"
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
                                                            {REACTIONS.map((emoji) => {
                                                                // Highlight if CURRENT USER already reacted with this emoji
                                                                const currentUserId = conversation?.currentUserId;
                                                                const myReaction = msg.reactions?.find(r => r.emoji === emoji);
                                                                const isSelected = !!myReaction && !!currentUserId && myReaction.userIds.some(id => id === currentUserId);
                                                                return (
                                                                    <button
                                                                        key={emoji}
                                                                        onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                                                                        className={`w-8 h-8 flex items-center justify-center rounded-full text-lg transition-all cursor-pointer ${isSelected
                                                                            ? "bg-primary/20 ring-2 ring-primary scale-110"
                                                                            : "hover:bg-muted"
                                                                            }`}
                                                                        title={isSelected ? `Remove ${emoji}` : `React with ${emoji}`}
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                );
                                                            })}
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

                                        <div className="flex items-center justify-end gap-1 mt-1 px-1">
                                            <span className="text-[10px] text-muted-foreground block text-right">
                                                {formatTimestamp(msg._creationTime)}
                                            </span>
                                            {msg.isCurrentUser && (
                                                <div className="transition-all duration-300">
                                                    {msg._creationTime <= otherLastRead ? (
                                                        <CheckCheck className="w-[14px] h-[14px] text-primary animate-in zoom-in spin-in-12 duration-300 drop-shadow-sm" />
                                                    ) : (
                                                        <Check className="w-[14px] h-[14px] text-muted-foreground/60" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
