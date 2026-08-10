import { cookies } from 'next/headers';
import { queryFirestoreDocs } from '@/lib/firestore-rest';

export interface FirebaseUser {
    id: string;
    email: string;
    token?: string;
}

export async function getServerUser(): Promise<FirebaseUser | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase_session')?.value;
    if (!sessionCookie) return null;

    try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        if (parsed?.uid && parsed?.email) {
            return { id: parsed.uid, email: parsed.email, token: parsed.token };
        }
    } catch (e) {
        try {
            const parsed = JSON.parse(sessionCookie);
            if (parsed?.uid && parsed?.email) {
                return { id: parsed.uid, email: parsed.email, token: parsed.token };
            }
        } catch (err) {
            return null;
        }
    }
    return null;
}

export async function getUserDocuments(userId: string, token?: string) {
    try {
        const docs = await queryFirestoreDocs('documents', 'user_id', userId, token);
        docs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        return docs as Array<{
            id: string;
            user_id: string;
            url: string;
            title: string;
            content?: string;
            excerpt?: string;
            created_at: string;
        }>;
    } catch (error) {
        console.error('Error fetching user documents:', error);
        return [];
    }
}


