import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, LayoutDashboard, Sparkles, LogOut, Brain } from 'lucide-react';
import { SidebarDocumentItem } from '@/components/sidebar-document-item';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
    currentDocumentId?: string;
    className?: string;
}

export async function AppSidebar({ currentDocumentId, className }: AppSidebarProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: documents } = await supabase
        .from('documents')
        .select('id, title, excerpt, url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className={cn("h-full flex flex-col bg-gradient-to-b from-muted/5 to-muted/20 hidden md:flex shrink-0", className)}>
            {/* Header */}
            <div className="p-4 border-b h-14 flex items-center bg-background/50 backdrop-blur-sm">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold group">
                    <div className="relative">
                        <Brain className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        <Sparkles className="w-2 h-2 absolute -top-1 -right-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold text-xl tracking-tight">
                        Recall Lite
                    </span>
                </Link>
            </div>

            {/* Add New URL Button */}
            <div className="p-4">
                <Link href="/dashboard">
                    <Button
                        className="w-full justify-start bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        <LayoutDashboard className="w-4 h-4 mr-2 transition-transform duration-500 group-hover:rotate-180" />
                        <span className="font-semibold tracking-wide">Dashboard</span>
                    </Button>
                </Link>
            </div>

            {/* Documents List */}
            <ScrollArea className="flex-1 px-2">
                <div className="space-y-1 p-2">
                    <div className="flex items-center justify-between mb-3 px-2">
                        <h4 className="text-sm font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Your Knowledge
                        </h4>
                        {documents && documents.length > 0 && (
                            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {documents.length}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1">
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
                    </div>

                    {documents?.length === 0 && (
                        <div className="text-center py-8 px-2">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                                <LayoutDashboard className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">No documents yet.</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Add a URL to get started!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* User Info Footer */}
            <div className="p-4 border-t bg-background/50 backdrop-blur-sm mt-auto">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate group cursor-default flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
                        </div>
                        <span className="truncate transition-colors duration-300 group-hover:text-foreground" title={user.email}>
                            {user.email}
                        </span>
                    </div>
                    <form action="/auth/signout" method="post">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors" title="Sign Out">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
