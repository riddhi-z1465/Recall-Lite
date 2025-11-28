import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';

interface DocumentCardProps {
    id: string;
    title: string;
    url: string;
    excerpt: string;
    createdAt: string;
}

export function DocumentCard({ id, title, url, excerpt, createdAt }: DocumentCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="line-clamp-1 text-lg" title={title}>
                    {title}
                </CardTitle>
                <CardDescription className="line-clamp-1 text-xs text-muted-foreground">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {url}
                    </a>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {excerpt}
                </p>
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-muted-foreground">
                        {new Date(createdAt).toLocaleDateString()}
                    </span>
                    <Link href={`/chat/${id}`}>
                        <Button size="sm" variant="secondary">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
