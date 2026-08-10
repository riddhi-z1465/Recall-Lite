import { AppSidebar } from '@/components/app-sidebar';
import { getServerUser } from '@/lib/firebase-server';
import { redirect } from 'next/navigation';
import { ResizableLayout } from '@/components/resizable-layout';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getServerUser();

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

