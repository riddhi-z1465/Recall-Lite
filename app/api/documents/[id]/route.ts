import { getServerUser } from '@/lib/firebase-server';
import { queryFirestoreDocs, deleteFirestoreDoc } from '@/lib/firestore-rest';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const documentId = params.id;

        // Delete all chunks associated with this document in Firestore via REST
        const chunks = await queryFirestoreDocs('chunks', 'document_id', documentId, user.token);
        await Promise.all(chunks.map((chunk) => deleteFirestoreDoc('chunks', chunk.id, user.token)));

        // Delete document in Firestore via REST
        await deleteFirestoreDoc('documents', documentId, user.token);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/documents/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



