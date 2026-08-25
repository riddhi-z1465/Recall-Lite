import { getServerUser, getUserDocuments } from '@/lib/firebase-server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark, Inbox } from 'lucide-react';
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
        <div className={cn("h-full flex flex-col bg-sidebar border-r border-sidebar-border hidden md:flex shrink-0 sidebar-container", className)}>
            {/* Header */}
            <div className="p-3 border-b border-sidebar-border h-13 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 font-medium group min-w-0">
                    <div className="flex items-center justify-center p-1.5 rounded-md border border-sidebar-border bg-card text-foreground">
                        <Bookmark className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-semibold text-sm tracking-tight hide-on-mini truncate min-w-0">
                        Recall Lite
                    </span>
                </Link>

                <div className="hide-on-mini">
                    <ThemeToggle />
                </div>
            </div>

            {/* Dashboard / All Articles Link */}
            <div className="p-2">
                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-xs font-medium h-8.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    >
                        <Inbox className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
                        <span className="hide-on-mini truncate min-w-0">All Saved Articles</span>
                        {documents && documents.length > 0 && (
                            <span className="ml-auto text-[11px] font-mono text-muted-foreground hide-on-mini">
                                {documents.length}
                            </span>
                        )}
                    </Button>
                </Link>
            </div>

            {/* Documents List Header */}
            <div className="px-3.5 py-1.5 flex items-center justify-between">
                <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider hide-on-mini">
                    Library
                </h4>
            </div>

            {/* Documents List */}
            <ScrollArea className="flex-1 px-1.5">
                <div className="space-y-0.5 p-0.5">
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
                            <p className="text-xs text-muted-foreground">No articles saved.</p>
                            <p className="text-[11px] text-muted-foreground/70 mt-0.5">Add a URL to get started.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* User Info Footer */}
            <div className="p-2.5 border-t border-sidebar-border mt-auto">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate group cursor-default flex-1 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate text-[11px] font-mono hide-on-mini min-w-0" title={user.email}>
                            {user.email}
                        </span>
                    </div>
                    <SignOutButton />
                </div>
            </div>
        </div>
    );
}
