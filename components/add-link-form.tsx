'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Link2, CheckCircle2, AlertCircle, Sparkles, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SAMPLE_LINKS = [
    { label: '🤖 Wikipedia AI', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
    { label: '⚛️ React Docs', url: 'https://react.dev/learn' },
    { label: '⚡ Next.js Features', url: 'https://nextjs.org/docs/app/building-your-application' },
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
                throw new Error(data.error || 'Failed to scrape and save link.');
            }

            setUrl('');
            router.refresh();
            setMessage({ type: 'success', text: 'Article scraped and added to your second brain!' });
            setTimeout(() => setMessage(null), 4000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error processing link.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-3">
            <div className="p-4 md:p-6 rounded-2xl border border-indigo-500/20 bg-card/80 dark:bg-card/60 backdrop-blur-xl shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                        <Link2 className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-semibold tracking-wide">Save New Web Article</h2>
                    <span className="text-xs text-muted-foreground ml-auto hidden sm:inline-block">Auto-scrapes text & creates vector embeddings</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        {detectedDomain ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${detectedDomain}&sz=32`}
                                alt={detectedDomain}
                                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 rounded"
                                onError={(e) => {
                                    // Fallback to Globe icon on image error
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        )}
                        <Input
                            type="url"
                            placeholder="Paste article URL (e.g. https://example.com/article)..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="pl-9 h-11 bg-background/60 focus:bg-background border-border/60 focus:border-indigo-500/50 transition-all text-sm"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="h-11 px-6 font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 shrink-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Link
                            </>
                        )}
                    </Button>
                </form>

                {/* Sample Link Quick Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Try example:
                    </span>
                    {SAMPLE_LINKS.map((sample) => (
                        <button
                            key={sample.url}
                            type="button"
                            onClick={() => setUrl(sample.url)}
                            className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition-colors"
                        >
                            {sample.label}
                        </button>
                    ))}
                </div>

                {/* Toast Status Message */}
                {message && (
                    <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${
                        message.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
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
