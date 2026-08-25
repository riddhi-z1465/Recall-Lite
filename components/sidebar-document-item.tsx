'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Check, Globe, FileText } from 'lucide-react';
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
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [copied, setCopied] = useState(false);
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

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (url) {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Failed to copy URL:', error);
            }
        }
    };

    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    return (
        <div
            className="relative group"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => { setShowPreview(false); setShowConfirm(false); }}
        >
            <Link href={`/chat/${id}`}>
                <div
                    className={cn(
                        "relative flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all text-xs cursor-pointer overflow-hidden",
                        isActive
                            ? "bg-accent text-foreground font-medium border border-border shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                        isDeleting && "opacity-40 pointer-events-none"
                    )}
                >
                    {/* Domain Favicon or Icon */}
                    <div className="shrink-0">
                        {domainHost && !faviconFailed ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${domainHost}&sz=32`}
                                alt={domainHost}
                                className="w-3.5 h-3.5 rounded-xs"
                                onError={() => setFaviconFailed(true)}
                            />
                        ) : (
                            <FileText className={cn(
                                "w-3.5 h-3.5",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                        )}
                    </div>

                    {/* Title */}
                    <span className="flex-1 truncate hide-on-mini min-w-0">
                        {title}
                    </span>

                    {/* Quick actions on hover */}
                    <div className={cn(
                        "flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hide-on-mini",
                        (isActive || showConfirm) && "opacity-100"
                    )}>
                        {url && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-5.5 w-5.5 text-muted-foreground hover:text-foreground"
                                onClick={handleCopy}
                                title={copied ? "Copied" : "Copy link"}
                            >
                                {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </Button>
                        )}
                        <Button
                            size="icon"
                            variant={showConfirm ? "destructive" : "ghost"}
                            className={cn(
                                "h-5.5 text-muted-foreground hover:text-destructive",
                                showConfirm ? "w-auto px-1.5 text-[10px] text-destructive-foreground hover:text-destructive-foreground bg-destructive" : "w-5.5"
                            )}
                            onClick={handleDelete}
                            disabled={isDeleting}
                            title={showConfirm ? "Confirm Delete" : "Delete"}
                        >
                            {showConfirm ? (
                                <span>Delete?</span>
                            ) : (
                                <Trash2 className="w-3 h-3" />
                            )}
                        </Button>
                    </div>
                </div>
            </Link>

            {/* Hover Preview Tooltip */}
            {showPreview && !showConfirm && excerpt && (
                <div
                    className="absolute left-full ml-2 top-0 z-50 w-72 p-3 bg-popover text-popover-foreground border border-border rounded-md shadow-md"
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="space-y-1.5 text-xs">
                        <h4 className="font-medium text-foreground line-clamp-2 leading-snug">{title}</h4>
                        {url && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate font-mono">
                                <Globe className="w-3 h-3 shrink-0" />
                                <span className="truncate">{domainHost || url}</span>
                            </div>
                        )}
                        <p className="text-muted-foreground line-clamp-3 text-[11px] leading-relaxed">
                            {excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-1.5 border-t border-border text-[10px] text-muted-foreground">
                            <span>{formattedDate}</span>
                            <span className="text-primary font-medium">Ready to chat</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
