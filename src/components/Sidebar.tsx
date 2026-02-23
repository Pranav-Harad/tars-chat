"use client";

import { useState } from "react";

import { api } from "../../convex/_generated/api";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";

export function Sidebar() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    // Don't query users if the current user isn't fully signed in 
    // to avoid unauthorized errors if we strictly check identity.
    const users = useQuery(api.users.getOtherUsers, isSignedIn ? { searchQuery } : "skip");
    const conversations = useQuery(api.conversations.list, isSignedIn ? undefined : "skip");
    const createOrGetConversation = useMutation(api.conversations.createOrGet);

    const handleUserClick = async (userId: Id<"users">) => {
        try {
            const conversationId = await createOrGetConversation({ participantId: userId });
            router.push(`/chat/${conversationId}`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleConversationClick = (conversationId: Id<"conversations">) => {
        router.push(`/chat/${conversationId}`);
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="w-full md:w-80 h-full border-r flex flex-col bg-card/50 backdrop-blur-xl shrink-0 shadow-sm z-10">
            <div className="p-4 border-b bg-background/50 backdrop-blur-md sticky top-0 z-20">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                    Messages
                </h2>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-muted/40 border-muted focus-visible:ring-1 focus-visible:ring-primary/30 transition-all rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                    {(!users || !conversations) && isSignedIn ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-3 rounded-xl animate-pulse">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[60%]" />
                                    <Skeleton className="h-3 w-[40%]" />
                                </div>
                            </div>
                        ))
                    ) : !isSignedIn ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Sign in to see users</div>
                    ) : isSearching ? (
                        users?.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 opacity-60">
                                <Search className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">No users found</p>
                            </div>
                        ) : (
                            // Search Results (Users)
                            <>
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Users
                                </div>
                                {users?.map((user) => (
                                    <button
                                        onClick={() => handleUserClick(user._id as Id<"users">)}
                                        key={user._id}
                                        className="w-full flex items-center space-x-3 p-3 hover:bg-muted/60 focus:bg-muted/80 rounded-xl transition-all duration-200 text-left group"
                                    >
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border border-border/50 group-hover:border-primary/20 transition-colors">
                                                <AvatarImage src={user.avatarUrl} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {user.isOnline && (
                                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm ring-1 ring-green-500/20"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate pr-2">{user.name}</h3>
                                            <p className="text-xs text-muted-foreground truncate opacity-80 mt-0.5">
                                                Start messaging...
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </>
                        )
                    ) : (
                        // Conversations List
                        conversations?.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 opacity-60">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                                </div>
                                <p className="text-sm font-medium">No conversations yet</p>
                                <p className="text-xs text-muted-foreground">Search for a user to start</p>
                            </div>
                        ) : (
                            <>
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Recent
                                </div>
                                {conversations?.map((conv) => {
                                    const otherUser = conv.otherUser;
                                    if (!otherUser) return null;
                                    return (
                                        <button
                                            onClick={() => handleConversationClick(conv._id as Id<"conversations">)}
                                            key={conv._id}
                                            className="w-full flex items-center space-x-3 p-3 hover:bg-muted/60 focus:bg-muted/80 rounded-xl transition-all duration-200 text-left group"
                                        >
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border border-border/50 group-hover:border-primary/20 transition-colors">
                                                    <AvatarImage src={otherUser.avatarUrl} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                        {otherUser.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {otherUser.isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm ring-1 ring-green-500/20"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h3 className="font-semibold text-sm truncate pr-2">{otherUser.name}</h3>
                                                    {conv.lastMessage && (
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center mt-0.5 w-full">
                                                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : !conv.lastMessage ? 'italic text-muted-foreground/60' : 'text-muted-foreground opacity-90'}`}>
                                                        {conv.lastMessage
                                                            ? `${conv.lastMessage.isCurrentUser ? 'You: ' : ''}${conv.lastMessage.text}`
                                                            : 'No messages yet...'}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <div className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-2 shrink-0">
                                                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </>
                        )
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
