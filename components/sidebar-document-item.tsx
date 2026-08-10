'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, Share2, Star, ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SidebarDocumentItemProps {
    id: string;
    title: string;
    excerpt?: string;
    url?: string;
    createdAt: string;
    isActive?: boolean;
}

export function SidebarDocumentItem({
    id,
    title,
    excerpt,
    url,
    createdAt,
    isActive
}: SidebarDocumentItemProps) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [faviconFailed, setFaviconFailed] = useState(false);

    const domainHost = (() => {
        if (!url) return null;
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return null;
        }
    })();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this document?')) {
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
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (url) {
            try {
                await navigator.clipboard.writeText(url);
                alert('URL copied to clipboard!');
            } catch (error) {
                console.error('Failed to copy URL:', error);
            }
        }
    };

    const handleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorite(!isFavorite);
    };

    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    return (
        <div
            className="relative group"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
        >
            <Link href={`/chat/${id}`}>
                <div
                    className={cn(
                        "relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden text-xs",
                        "hover:bg-accent/80 hover:text-accent-foreground",
                        isActive
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500 shadow-xs"
                            : "text-muted-foreground hover:text-foreground",
                        isDeleting && "opacity-50 pointer-events-none"
                    )}
                >
                    {/* Domain Favicon or Message Icon */}
                    <div className="shrink-0">
                        {domainHost && !faviconFailed ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${domainHost}&sz=32`}
                                alt={domainHost}
                                className="w-3.5 h-3.5 rounded"
                                onError={() => setFaviconFailed(true)}
                            />
                        ) : (
                            <MessageSquare className={cn(
                                "w-3.5 h-3.5 transition-colors",
                                isActive ? "text-indigo-500" : "text-muted-foreground"
                            )} />
                        )}
                    </div>

                    {/* Title */}
                    <span className="flex-1 truncate hide-on-mini min-w-0">
                        {title}
                    </span>

                    {/* Favorite star */}
                    {isFavorite && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0 hide-on-mini" />
                    )}

                    {/* Quick actions on hover */}
                    <div className={cn(
                        "flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hide-on-mini",
                        isActive && "opacity-100"
                    )}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 hover:bg-amber-500/20 hover:text-amber-600"
                            onClick={handleFavorite}
                            title="Favorite"
                        >
                            <Star className={cn("w-3 h-3", isFavorite && "fill-amber-500 text-amber-500")} />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 hover:bg-indigo-500/20 hover:text-indigo-600"
                            onClick={handleShare}
                            title="Copy link"
                        >
                            <Share2 className="w-3 h-3" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 hover:bg-rose-500/20 hover:text-rose-600"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </Link>

            {/* Hover Preview Tooltip */}
            {showPreview && excerpt && (
                <div
                    className="absolute left-full ml-2 top-0 z-50 w-72 p-3.5 bg-popover/95 backdrop-blur-md border border-border/60 rounded-xl shadow-xl animate-in fade-in slide-in-from-left-2 duration-200"
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="space-y-2 text-xs">
                        <h4 className="font-semibold text-foreground line-clamp-2">{title}</h4>
                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1 truncate"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{url}</span>
                            </a>
                        )}
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed text-[11px]">
                            {excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                            <span>{formattedDate}</span>
                            <span className="text-emerald-500 font-medium">Ready for Chat</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
