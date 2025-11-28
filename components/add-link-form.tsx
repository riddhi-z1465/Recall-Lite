'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { useToast } from '@/hooks/use-toast'; 
// shadcn usually adds a toaster. I'll assume standard toast or just simple alert for now, or check if toast is installed.
// I'll stick to simple state for now to avoid missing dependency issues, or I'll check if I installed toast.
// I didn't install toast. I'll just use local state message.

export function AddLinkForm() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/add-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add link');
            }

            setUrl('');
            router.refresh();
            setMessage('Link added successfully!');
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    type="url"
                    placeholder="Paste a URL to save (e.g. https://example.com/article)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Plus className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Processing...' : 'Add Link'}
                </Button>
            </form>
            {message && (
                <p className={`text-sm mt-2 ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
