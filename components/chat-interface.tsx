'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Send, ArrowLeft, Menu, LayoutDashboard, Plus, MessageSquare } from 'lucide-react';
import Link from 'next/link';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

interface ChatInterfaceProps {
    documentId: string;
    initialMessages?: Message[];
    documents?: { id: string; title: string }[];
    userEmail?: string;
}

export function ChatInterface({ documentId, documents = [], userEmail }: ChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // ... handleSubmit ...
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    documentId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            const assistantMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
            }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    assistantMessage += chunk;

                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: assistantMessage }
                                : msg
                        )
                    );
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, there was an error processing your request.',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full w-full bg-background">
            <header className="flex items-center p-4 border-b md:hidden justify-between">
                <div className="flex items-center">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="mr-2">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-semibold">Chat</h1>
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <div className="flex flex-col h-full bg-background">
                            <div className="p-4 border-b h-14 flex items-center">
                                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span>Recall Lite</span>
                                </Link>
                            </div>
                            <div className="p-4">
                                <Link href="/dashboard">
                                    <Button className="w-full justify-start" variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New URL
                                    </Button>
                                </Link>
                            </div>
                            <ScrollArea className="flex-1 px-2">
                                <div className="space-y-1 p-2">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Your Knowledge</h4>
                                    {documents.map((doc) => (
                                        <Link key={doc.id} href={`/chat/${doc.id}`}>
                                            <Button
                                                variant={documentId === doc.id ? "secondary" : "ghost"}
                                                className="w-full justify-start text-sm font-normal truncate"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2 shrink-0" />
                                                <span className="truncate">{doc.title}</span>
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="truncate">{userEmail}</span>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col relative">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4 max-w-3xl mx-auto pb-20">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-20">
                                <p>Ask a question about this document.</p>
                            </div>
                        )}
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-lg p-3">
                                    <span className="animate-pulse">...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background">
                    <form
                        onSubmit={handleSubmit}
                        className="max-w-3xl mx-auto flex gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
