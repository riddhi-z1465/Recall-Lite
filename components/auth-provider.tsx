'use client';

import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onIdTokenChanged } from 'firebase/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const sessionData = JSON.stringify({ uid: user.uid, email: user.email, token });
                    document.cookie = `firebase_session=${encodeURIComponent(sessionData)}; path=/; max-age=604800; SameSite=Lax`;
                } catch (err) {
                    console.warn('Failed to refresh Firebase token:', err);
                }
            } else {
                document.cookie = 'firebase_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            }
        });
        return () => unsubscribe();
    }, []);

    return <>{children}</>;
}
