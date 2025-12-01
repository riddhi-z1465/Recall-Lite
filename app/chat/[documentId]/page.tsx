import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';
import { AppSidebar } from '@/components/app-sidebar';
import { ResizableLayout } from '@/components/resizable-layout';

interface ChatPageProps {
    params: Promise<{
        documentId: string;
    }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { documentId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Validate documentId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(documentId)) {
        redirect('/dashboard');
    }

    // Fetch all documents for the sidebar
    const { data: documents } = await supabase
        .from('documents')
        .select('id, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Verify current document exists
    const { data: currentDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

    if (!currentDoc) {
        redirect('/dashboard');
    }

    return (
        <ResizableLayout sidebar={<AppSidebar currentDocumentId={documentId} />}>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <ChatInterface
                    documentId={documentId}
                    documents={documents || []}
                    userEmail={user.email}
                />
            </div>
        </ResizableLayout>
    );
}
