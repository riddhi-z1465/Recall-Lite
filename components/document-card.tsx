'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, ExternalLink, Copy, Check, Clock, FileText } from 'lucide-react';
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
            <Card className="group relative border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all">
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Domain Favicon or Icon */}
                        <div className="p-2 rounded-md bg-muted border border-border shrink-0 mt-0.5">
                            {domainHost && !faviconFailed ? (
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${domainHost}&sz=32`}
                                    alt={domainHost}
                                    className="w-4 h-4 rounded-xs"
                                    onError={() => setFaviconFailed(true)}
                                />
                            ) : (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/chat/${id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                                    {title}
                                </Link>
                                {domainHost && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/80 shrink-0">
                                        {domainHost}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 leading-normal">
                                {excerpt || 'No content preview available.'}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span>{formattedDate}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {readTimeMinutes} min read
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {url && (
                            <>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7.5 w-7.5 text-muted-foreground hover:text-foreground"
                                    onClick={handleCopyUrl}
                                    title={copied ? "Copied" : "Copy URL"}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                                    title="Open original webpage"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </>
                        )}
                        <Link href={`/chat/${id}`}>
                            <Button size="sm" className="h-7.5 px-3 text-xs font-medium">
                                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                Chat
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant={showConfirm ? "destructive" : "ghost"}
                            className="h-7.5 text-xs text-muted-foreground hover:text-destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {showConfirm && <span className="ml-1 text-[11px]">Confirm?</span>}
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="group relative flex flex-col h-full border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all">
            <div className="p-4 space-y-2.5 flex-1 flex flex-col">
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {domainHost && !faviconFailed ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${domainHost}&sz=32`}
                                alt={domainHost}
                                className="w-3.5 h-3.5 rounded-xs shrink-0"
                                onError={() => setFaviconFailed(true)}
                            />
                        ) : (
                            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                        {domainHost ? (
                            <span className="text-[11px] font-mono text-muted-foreground truncate">
                                {domainHost}
                            </span>
                        ) : (
                            <span className="text-[11px] text-muted-foreground">Document</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {url && (
                            <>
                                <button
                                    onClick={handleCopyUrl}
                                    className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                                    title={copied ? "Copied" : "Copy URL"}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                                    title="Open original webpage"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                    <Link href={`/chat/${id}`} className="hover:text-primary transition-colors">
                        {title}
                    </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                    {excerpt || 'No excerpt available.'}
                </p>

                {/* Card footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2 mt-auto text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {readTimeMinutes}m
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            size="sm"
                            variant={showConfirm ? "destructive" : "ghost"}
                            className="h-7.5 px-2 text-xs text-muted-foreground hover:text-destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {showConfirm && <span className="ml-1 text-[11px]">Confirm?</span>}
                        </Button>
                        <Link href={`/chat/${id}`}>
                            <Button size="sm" className="h-7.5 px-3 text-xs font-medium">
                                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                Chat
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    );
}
