import { getServerUser, getUserDocuments } from '@/lib/firebase-server';
import { DashboardClient } from '@/components/dashboard-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const user = await getServerUser();
    if (!user) {
        redirect('/login');
    }

    const documents = await getUserDocuments(user.id, user.token);

    return (
        <div className="h-full overflow-y-auto">
            <DashboardClient documents={documents || []} userEmail={user.email} />
        </div>
    );
}
