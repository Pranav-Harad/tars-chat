"use client";

import { useState } from "react";

import { api } from "../../convex/_generated/api";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { Search, Users, PlusCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";

export function Sidebar() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    // Don't query users if the current user isn't fully signed in 
    // to avoid unauthorized errors if we strictly check identity.
    const users = useQuery(api.users.getOtherUsers, isSignedIn ? { searchQuery } : "skip");
    const conversations = useQuery(api.conversations.list, isSignedIn ? undefined : "skip");
    const createOrGetConversation = useMutation(api.conversations.createOrGet);
    const createGroup = useMutation(api.conversations.createGroup);

    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);

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

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;
        try {
            const conversationId = await createGroup({
                name: groupName.trim(),
                participantIds: selectedUsers,
            });
            setIsGroupDialogOpen(false);
            setGroupName("");
            setSelectedUsers([]);
            router.push(`/chat/${conversationId}`);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleUserSelection = (userId: Id<"users">) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="w-full md:w-80 h-full border-r flex flex-col bg-card/50 backdrop-blur-xl shrink-0 shadow-sm z-10">
            <div className="p-4 border-b bg-background/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Pranverse
                    </h2>

                    <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary">
                                <PlusCircle className="h-5 w-5" />
                                <span className="sr-only">Create Group</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Group Chat</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    placeholder="Group Name"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="col-span-3"
                                />
                                <div className="space-y-2">
                                    <h4 className="text-sm border-b pb-2 font-medium">Select Members</h4>
                                    <ScrollArea className="h-[200px] border rounded-md p-2">
                                        {!users || users.length === 0 ? (
                                            <p className="text-center text-sm text-muted-foreground pt-4">No users available</p>
                                        ) : (
                                            users.map(user => (
                                                <button
                                                    key={user._id}
                                                    onClick={() => toggleUserSelection(user._id as Id<"users">)}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${selectedUsers.includes(user._id as Id<"users">) ? 'bg-primary/10' : 'hover:bg-muted'}`}
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.avatarUrl} />
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="flex-1 text-sm font-medium">{user.name}</span>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedUsers.includes(user._id as Id<"users">) ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}>
                                                        {selectedUsers.includes(user._id as Id<"users">) && (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button disabled={!groupName.trim() || selectedUsers.length === 0} onClick={handleCreateGroup}>
                                    Create Group
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
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
                                    const displayInfo = conv.displayInfo;
                                    if (!displayInfo) return null;
                                    return (
                                        <button
                                            onClick={() => handleConversationClick(conv._id as Id<"conversations">)}
                                            key={conv._id}
                                            className="w-full flex items-center space-x-3 p-3 hover:bg-muted/60 focus:bg-muted/80 rounded-xl transition-all duration-200 text-left group"
                                        >
                                            <div className="relative">
                                                {conv.isGroup ? (
                                                    <div className="h-12 w-12 rounded-full border border-border/50 group-hover:border-primary/20 transition-colors bg-primary/10 flex items-center justify-center text-primary">
                                                        <Users className="h-6 w-6" />
                                                    </div>
                                                ) : (
                                                    <Avatar className="h-12 w-12 border border-border/50 group-hover:border-primary/20 transition-colors">
                                                        <AvatarImage src={displayInfo.avatarUrl} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                            {displayInfo.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                {!conv.isGroup && displayInfo.isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm ring-1 ring-green-500/20"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h3 className="font-semibold text-sm truncate pr-2">
                                                        {displayInfo.name} {conv.isGroup && <span className="text-muted-foreground font-normal text-xs ml-1">({conv.memberCount})</span>}
                                                    </h3>
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
