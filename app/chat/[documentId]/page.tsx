import { getServerUser, getUserDocuments } from '@/lib/firebase-server';
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
    const user = await getServerUser();

    if (!user) {
        redirect('/login');
    }

    if (!documentId) {
        redirect('/dashboard');
    }

    // Fetch all documents for sidebar & validation
    const documents = await getUserDocuments(user.id, user.token);
    const currentDoc = documents.find(d => d.id === documentId);

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

