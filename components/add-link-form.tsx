'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Link2, CheckCircle2, AlertCircle, Globe, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SAMPLE_LINKS = [
    { label: 'React 19 Docs', url: 'https://react.dev/learn' },
    { label: 'Next.js App Router', url: 'https://nextjs.org/docs/app/building-your-application' },
    { label: 'MDN Web APIs', url: 'https://developer.mozilla.org/en-US/docs/Web/API' },
];

export function AddLinkForm() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const router = useRouter();

    const getDomainHost = (inputUrl: string) => {
        try {
            const parsed = new URL(inputUrl);
            return parsed.hostname.replace('www.', '');
        } catch {
            return null;
        }
    };

    const detectedDomain = getDomainHost(url);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/add-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to extract and save link.');
            }

            setUrl('');
            router.refresh();
            setMessage({ type: 'success', text: 'Article scraped and indexed. Ready for search & chat.' });
            setTimeout(() => setMessage(null), 4000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error processing link.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-2.5">
            <div className="p-4 rounded-lg border border-border bg-card shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-primary" />
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                            Save Web Page
                        </h2>
                    </div>
                    <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                        Auto-extracts article content & creates vector embeddings
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        {detectedDomain ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${detectedDomain}&sz=32`}
                                alt={detectedDomain}
                                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 rounded-xs"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        )}
                        <Input
                            type="url"
                            placeholder="https://example.com/article-or-documentation"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="pl-9 h-9.5 text-sm bg-background border-border"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="h-9.5 px-4 text-xs font-medium shrink-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                Scraping & Indexing...
                            </>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add Article
                            </>
                        )}
                    </Button>
                </form>

                {/* Sample quick links */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
                        <BookOpen className="w-3 h-3" /> Try example:
                    </span>
                    {SAMPLE_LINKS.map((sample) => (
                        <button
                            key={sample.url}
                            type="button"
                            onClick={() => setUrl(sample.url)}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-muted hover:bg-accent text-muted-foreground hover:text-foreground border border-border/80 transition-colors"
                        >
                            {sample.label}
                        </button>
                    ))}
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`mt-2.5 p-2.5 rounded-md flex items-center gap-2 text-xs font-medium ${message.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
