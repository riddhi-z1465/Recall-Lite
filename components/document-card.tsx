'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertTriangle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentCardProps {
    id: string;
    title: string;
    url?: string | null;
    excerpt: string;
    createdAt: string;
}

export function DocumentCard({ id, title, url, excerpt, createdAt }: DocumentCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');

    // Check if ID is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidId = uuidRegex.test(id);

    // Format date on client side only to avoid hydration mismatch
    useEffect(() => {
        setFormattedDate(new Date(createdAt).toLocaleDateString());
    }, [createdAt]);

    const handleDelete = async () => {
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

            // Refresh the page to show updated list
            router.refresh();
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <Card className={`flex flex-col h-full transition-shadow ${isValidId ? 'hover:shadow-md' : 'border-yellow-500 bg-yellow-50/50'}`}>
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-lg flex-1" title={title}>
                        {title}
                    </CardTitle>
                    {!isValidId && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 shrink-0">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Invalid
                        </Badge>
                    )}
                </div>
                <CardDescription className="line-clamp-1 text-xs text-muted-foreground">
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {url}
                        </a>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {excerpt}
                </p>
                <div className="flex justify-between items-center mt-auto gap-2">
                    <span className="text-xs text-muted-foreground">
                        {formattedDate}
                    </span>
                    <div className="flex gap-2">
                        {isValidId ? (
                            <Link href={`/chat/${id}`}>
                                <Button size="sm" variant="secondary">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Chat
                                </Button>
                            </Link>
                        ) : (
                            <Button size="sm" variant="outline" disabled className="border-yellow-500 text-yellow-600">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Invalid ID
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant={showConfirm ? "destructive" : "outline"}
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {showConfirm ? 'Confirm?' : isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
