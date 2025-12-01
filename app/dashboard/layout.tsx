import { AppSidebar } from '@/components/app-sidebar';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ResizableLayout } from '@/components/resizable-layout';

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
        <ResizableLayout sidebar={<AppSidebar />}>
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {children}
            </main>
        </ResizableLayout>
    );
}
