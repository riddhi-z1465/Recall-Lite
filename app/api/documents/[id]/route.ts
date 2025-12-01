import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const documentId = params.id;

        // First, delete all chunks associated with this document
        const { error: chunksError } = await supabase
            .from('chunks')
            .delete()
            .eq('document_id', documentId);

        if (chunksError) {
            console.error('Error deleting chunks:', chunksError);
            return NextResponse.json(
                { error: 'Failed to delete document chunks' },
                { status: 500 }
            );
        }

        // Then delete the document itself
        const { error: documentError } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId)
            .eq('user_id', user.id); // Ensure user can only delete their own documents

        if (documentError) {
            console.error('Error deleting document:', documentError);
            return NextResponse.json(
                { error: 'Failed to delete document' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/documents/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
