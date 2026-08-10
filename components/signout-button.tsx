'use client';

import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (e) {
            console.error('Sign out error:', e);
        }
        document.cookie = 'firebase_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/login');
        router.refresh();
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sign Out"
            onClick={handleSignOut}
        >
            <LogOut className="w-4 h-4" />
        </Button>
    );
}
