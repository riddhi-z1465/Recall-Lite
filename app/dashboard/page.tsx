import { createClient } from '@/lib/supabase-server';
import { AddLinkForm } from '@/components/add-link-form';
import { DocumentCard } from '@/components/document-card';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Recall Lite</h1>
                    <p className="text-muted-foreground">
                        Your second brain. Save links, chat with them.
                    </p>
                </div>

                <AddLinkForm />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents?.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            id={doc.id}
                            title={doc.title}
                            url={doc.url}
                            excerpt={doc.excerpt || ''}
                            createdAt={doc.created_at}
                        />
                    ))}
                    {documents?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            No documents found. Add a link to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
