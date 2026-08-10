'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, ExternalLink, Copy, Check, Clock, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentCardProps {
    id: string;
    title: string;
    url?: string | null;
    excerpt: string;
    createdAt: string;
    viewMode?: 'grid' | 'list';
}

export function DocumentCard({ id, title, url, excerpt, createdAt, viewMode = 'grid' }: DocumentCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');
    const [copied, setCopied] = useState(false);
    const [faviconFailed, setFaviconFailed] = useState(false);

    // Extract domain host
    const domainHost = (() => {
        if (!url) return null;
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return null;
        }
    })();

    // Estimate word count and read time
    const wordCount = excerpt ? excerpt.split(/\s+/).filter(Boolean).length : 0;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 150));

    useEffect(() => {
        if (createdAt) {
            const dateObj = new Date(createdAt);
            setFormattedDate(dateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }));
        }
    }, [createdAt]);

    const handleCopyUrl = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (url) {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy URL:', err);
            }
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            router.refresh();
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    if (viewMode === 'list') {
        return (
            <Card className="group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-md hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Domain Favicon or Icon */}
                        <div className="p-2.5 rounded-xl bg-muted/60 border border-border/40 shrink-0 mt-0.5">
                            {domainHost && !faviconFailed ? (
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${domainHost}&sz=32`}
                                    alt={domainHost}
                                    className="w-5 h-5 rounded"
                                    onError={() => setFaviconFailed(true)}
                                />
                            ) : (
                                <Globe className="w-5 h-5 text-indigo-500" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/chat/${id}`} className="font-semibold hover:text-indigo-500 transition-colors line-clamp-1">
                                    {title}
                                </Link>
                                {domainHost && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                                        {domainHost}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                                {excerpt || 'No excerpt available.'}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                                <span>{formattedDate}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {readTimeMinutes} min read
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {url && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={handleCopyUrl}
                                title="Copy URL"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                        )}
                        <Link href={`/chat/${id}`}>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm">
                                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                Chat
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant={showConfirm ? "destructive" : "ghost"}
                            className="h-8 text-xs"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            {showConfirm ? 'Confirm?' : 'Delete'}
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="group relative flex flex-col h-full overflow-hidden border-border/60 bg-card/60 backdrop-blur-md hover:border-indigo-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Top Accent Gradient Border */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardHeader className="pb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {domainHost && !faviconFailed ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${domainHost}&sz=32`}
                                alt={domainHost}
                                className="w-4 h-4 rounded shrink-0"
                                onError={() => setFaviconFailed(true)}
                            />
                        ) : (
                            <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                        )}
                        {domainHost && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 truncate">
                                {domainHost}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded text-muted-foreground hover:text-indigo-500 transition-colors"
                                title="Open original link"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>

                <CardTitle className="text-base font-bold line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Link href={`/chat/${id}`}>
                        {title}
                    </Link>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-0">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {excerpt || 'No excerpt available.'}
                </p>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2 mt-auto text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" /> {readTimeMinutes}m
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Button
                            size="sm"
                            variant={showConfirm ? "destructive" : "outline"}
                            className="h-8 text-xs px-2.5"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {showConfirm && <span className="ml-1">Confirm?</span>}
                        </Button>
                        <Link href={`/chat/${id}`}>
                            <Button size="sm" className="h-8 text-xs px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-sm">
                                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                Chat
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
