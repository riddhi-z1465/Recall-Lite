'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, Share2, Star, ExternalLink } from 'lucide-react';
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
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

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
            onMouseEnter={() => {
                setIsHovered(true);
                setShowPreview(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowPreview(false);
            }}
        >
            <Link href={`/chat/${id}`}>
                <div
                    className={cn(
                        "relative flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-300 ease-out cursor-pointer overflow-hidden",
                        "hover:bg-secondary/80 hover:shadow-sm hover:scale-[1.02]",
                        isActive && "bg-secondary shadow-sm",
                        isDeleting && "opacity-50 pointer-events-none"
                    )}
                >
                    {/* Animated gradient background on hover */}
                    <div
                        className={cn(
                            "absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 transition-opacity duration-500",
                            isHovered && "opacity-100"
                        )}
                        style={{
                            backgroundSize: '200% 100%',
                            animation: isHovered ? 'shimmer 2s infinite' : 'none'
                        }}
                    />

                    {/* Icon with animation */}
                    <div className={cn(
                        "shrink-0 transition-all duration-300",
                        isHovered && "scale-110 rotate-3"
                    )}>
                        <MessageSquare className={cn(
                            "w-4 h-4 transition-colors duration-300",
                            isActive ? "text-primary" : "text-muted-foreground",
                            isHovered && "text-primary"
                        )} />
                    </div>

                    {/* Title */}
                    <span className={cn(
                        "flex-1 text-sm font-normal truncate transition-all duration-300 relative z-10",
                        isActive && "font-medium",
                        isHovered && "font-medium"
                    )}>
                        {title}
                    </span>

                    {/* Favorite star */}
                    {isFavorite && (
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0 animate-in zoom-in duration-300" />
                    )}

                    {/* Quick actions - slide in on hover */}
                    <div className={cn(
                        "flex items-center gap-1 shrink-0 transition-all duration-300 ease-out",
                        isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
                    )}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 hover:bg-yellow-500/20 hover:text-yellow-600 transition-all duration-200 hover:scale-110"
                            onClick={handleFavorite}
                        >
                            <Star className={cn(
                                "w-3 h-3 transition-all duration-200",
                                isFavorite && "fill-yellow-500 text-yellow-500"
                            )} />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 hover:bg-blue-500/20 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                            onClick={handleShare}
                        >
                            <Share2 className="w-3 h-3" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 hover:bg-red-500/20 hover:text-red-600 transition-all duration-200 hover:scale-110"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </Link>

            {/* Hover Preview Tooltip */}
            {showPreview && excerpt && (
                <div
                    className="absolute left-full ml-2 top-0 z-50 w-72 p-4 bg-popover border rounded-lg shadow-lg animate-in fade-in slide-in-from-left-2 duration-200"
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{title}</h4>
                        </div>
                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{url}</span>
                            </a>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-4">
                            {excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">{formattedDate}</span>
                            <div className="flex gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-muted-foreground">Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
