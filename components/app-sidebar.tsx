import { getServerUser, getUserDocuments } from '@/lib/firebase-server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, Sparkles, Brain } from 'lucide-react';
import { SidebarDocumentItem } from '@/components/sidebar-document-item';
import { SignOutButton } from '@/components/signout-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
    currentDocumentId?: string;
    className?: string;
}

export async function AppSidebar({ currentDocumentId, className }: AppSidebarProps) {
    const user = await getServerUser();

    if (!user) return null;

    const documents = await getUserDocuments(user.id, user.token);

    return (
        <div className={cn("h-full flex flex-col bg-sidebar/80 border-r border-sidebar-border backdrop-blur-xl hidden md:flex shrink-0 sidebar-container selection:bg-indigo-500/20", className)}>
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border h-14 flex items-center justify-between bg-sidebar/90">
                <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold group min-w-0">
                    <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 shadow-xs">
                        <Brain className="w-5 h-5 text-indigo-500 transition-transform duration-300 group-hover:scale-110" />
                        <Sparkles className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className="text-foreground font-bold text-lg tracking-tight hide-on-mini truncate min-w-0">
                        Recall Lite
                    </span>
                </Link>

                <div className="hide-on-mini">
                    <ThemeToggle />
                </div>
            </div>

            {/* Dashboard Button */}
            <div className="p-3">
                <Link href="/dashboard">
                    <Button
                        className="w-full justify-start bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold shadow-xs hover:shadow-indigo-500/10 transition-all duration-200 group rounded-xl h-10"
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12 shrink-0 text-indigo-500" />
                        <span className="font-semibold text-xs tracking-wide hide-on-mini truncate min-w-0">Dashboard</span>
                    </Button>
                </Link>
            </div>

            {/* Documents List Header */}
            <div className="px-5 py-1.5 flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hide-on-mini truncate min-w-0">
                    Knowledge Base
                </h4>
                {documents && documents.length > 0 && (
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full hide-on-mini">
                        {documents.length}
                    </span>
                )}
            </div>

            {/* Documents List */}
            <ScrollArea className="flex-1 px-2">
                <div className="space-y-0.5 p-1">
                    {documents?.map((doc) => (
                        <SidebarDocumentItem
                            key={doc.id}
                            id={doc.id}
                            title={doc.title}
                            excerpt={doc.excerpt || ''}
                            url={doc.url}
                            createdAt={doc.created_at}
                            isActive={currentDocumentId === doc.id}
                        />
                    ))}

                    {documents?.length === 0 && (
                        <div className="text-center py-8 px-2">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">No saved articles yet.</p>
                            <p className="text-[11px] text-muted-foreground/70 mt-1">Add a URL to get started!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* User Info Footer */}
            <div className="p-3 border-t border-sidebar-border bg-sidebar/90 mt-auto">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate group cursor-default flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                        <span className="truncate transition-colors duration-300 group-hover:text-foreground hide-on-mini min-w-0" title={user.email}>
                            {user.email}
                        </span>
                    </div>
                    <SignOutButton />
                </div>
            </div>
        </div>
    );
}
