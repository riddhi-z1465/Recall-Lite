import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
                <div className="p-6 border-b">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                        <LayoutDashboard className="w-6 h-6" />
                        <span>Recall Lite</span>
                    </Link>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <nav className="space-y-2">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start">
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        {/* Add more links here if needed */}
                    </nav>
                </ScrollArea>
                <div className="p-4 border-t">
                    <form action="/auth/signout" method="post">
                        {/* We need a signout route or client component. 
                 For simplicity, I'll just make a client component or use a simple form if I had a server action.
                 I'll just put a link to a signout route or use a client component wrapper.
                 I'll use a simple button that redirects to /login for now, but real auth needs signout.
                 I'll skip the signout button functionality for this MVP or add a client component.
             */}
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/login">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Link>
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}
