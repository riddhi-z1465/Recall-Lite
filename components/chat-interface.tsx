'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Send,
    ArrowLeft,
    Menu,
    Copy,
    Check,
    ExternalLink,
    Bookmark,
    FileText,
    Inbox,
    Zap,
    Lightbulb,
    HelpCircle,
    ListTodo,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ChatMarkdown } from '@/components/chat-markdown';
import { ThemeToggle } from '@/components/theme-toggle';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

interface DocumentInfo {
    id: string;
    title: string;
    url?: string | null;
    excerpt?: string | null;
}

interface ChatInterfaceProps {
    documentId: string;
    initialMessages?: Message[];
    documents?: DocumentInfo[];
    userEmail?: string;
}

const STARTER_PROMPTS = [
    { label: '3-Point Summary', icon: Zap, prompt: 'Summarize the top 3 key takeaways from this document in clear bullet points.' },
    { label: 'Main Arguments', icon: Lightbulb, prompt: 'What are the main arguments and conclusions presented in this article?' },
    { label: 'Key Questions Answered', icon: HelpCircle, prompt: 'List 3 important questions this document answers, along with concise answers.' },
    { label: 'Actionable Steps', icon: ListTodo, prompt: 'Extract any practical advice, steps, or actionable insights mentioned in this text.' },
];

export function ChatInterface({ documentId, documents = [], userEmail }: ChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

    const currentDoc = documents.find((d) => d.id === documentId);

    const domainHost = (() => {
        if (!currentDoc?.url) return null;
        try {
            return new URL(currentDoc.url).hostname.replace('www.', '');
        } catch {
            return null;
        }
    })();

    const handleSendMessage = async (textToSend: string) => {
        if (!textToSend.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
        };

        setMessages((prev) => [...prev, userMessage]);
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
                const errorText = await response.text();
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: `Error: ${errorText || 'Sorry, there was an error processing your request.'}`,
                    },
                ]);
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            const assistantMessageId = (Date.now() + 1).toString();
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: '',
                },
            ]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    assistantMessage += chunk;

                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: assistantMessage }
                                : msg
                        )
                    );
                }
            }
        } catch (error: any) {
            console.error('Error in ChatInterface:', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `Error: ${error?.message || 'Sorry, there was an error processing your request.'}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    const handleCopyMessage = async (msgId: string, content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMsgId(msgId);
            setTimeout(() => setCopiedMsgId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full w-full bg-background">
            {/* Header with Active Document Context */}
            <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border bg-card sticky top-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-accent shrink-0">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-semibold truncate max-w-xs sm:max-w-md text-foreground" title={currentDoc?.title}>
                                {currentDoc?.title || 'Document Chat'}
                            </h1>
                            {domainHost && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/80 shrink-0 hidden sm:inline-block">
                                    {domainHost}
                                </span>
                            )}
                        </div>
                        {currentDoc?.url && (
                            <a
                                href={currentDoc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
                            >
                                <span className="truncate max-w-xs">{currentDoc.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <ThemeToggle />

                    {/* Mobile Drawer trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                                <Menu className="w-4 h-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0">
                            <div className="flex flex-col h-full bg-sidebar">
                                <div className="p-3 border-b border-sidebar-border h-13 flex items-center justify-between">
                                    <Link href="/dashboard" className="flex items-center gap-2 font-medium">
                                        <div className="p-1.5 rounded-md border border-sidebar-border bg-card">
                                            <Bookmark className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-foreground font-semibold text-sm">
                                            Recall Lite
                                        </span>
                                    </Link>
                                </div>

                                <div className="p-2">
                                    <Link href="/dashboard">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-xs font-medium h-8.5 rounded-md text-muted-foreground hover:text-foreground"
                                        >
                                            <Inbox className="w-4 h-4 mr-2 text-muted-foreground" />
                                            All Saved Articles
                                        </Button>
                                    </Link>
                                </div>

                                <div className="px-3.5 py-1.5 flex items-center justify-between">
                                    <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        Library
                                    </h4>
                                    {documents && documents.length > 0 && (
                                        <span className="text-[11px] font-mono text-muted-foreground">
                                            {documents.length}
                                        </span>
                                    )}
                                </div>

                                <ScrollArea className="flex-1 px-1.5">
                                    <div className="space-y-0.5 p-0.5">
                                        {documents.map((doc) => {
                                            const isSelected = documentId === doc.id;
                                            return (
                                                <Link key={doc.id} href={`/chat/${doc.id}`}>
                                                    <div
                                                        className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-all ${isSelected
                                                                ? 'bg-accent text-foreground font-medium border border-border'
                                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                                            }`}
                                                    >
                                                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                                        <span className="truncate">{doc.title}</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>

                                <div className="p-2.5 border-t border-sidebar-border mt-auto">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="truncate text-[11px] font-mono">{userEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Chat Body Scroll Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
                    <div className="space-y-5 max-w-3xl mx-auto pb-20">
                        {/* Empty State / Starter Suggestions */}
                        {messages.length === 0 && (
                            <div className="text-center space-y-5 my-10 max-w-lg mx-auto">
                                <div className="inline-flex items-center justify-center p-3 rounded-lg border border-border bg-card shadow-xs">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-semibold text-foreground">Query Article Context</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Answers are generated strictly from the scraped content of this webpage. Pick a prompt below or ask your own question.
                                    </p>
                                </div>

                                {/* Starter Chips */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-left">
                                    {STARTER_PROMPTS.map((starter) => {
                                        const Icon = starter.icon;
                                        return (
                                            <button
                                                key={starter.label}
                                                type="button"
                                                onClick={() => handleSendMessage(starter.prompt)}
                                                className="p-3 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-accent/50 transition-all text-left space-y-1 shadow-2xs group"
                                            >
                                                <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                                                    <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                                                    {starter.label}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground line-clamp-1">
                                                    {starter.prompt}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Message History */}
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {m.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-md border border-border bg-card text-foreground flex items-center justify-center shrink-0 mt-0.5">
                                        <Bookmark className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                )}

                                <div
                                    className={`relative group max-w-[85%] sm:max-w-[80%] rounded-lg p-3.5 text-sm ${m.role === 'user'
                                            ? 'bg-primary text-primary-foreground font-normal'
                                            : 'bg-card border border-border text-foreground shadow-2xs'
                                        }`}
                                >
                                    {m.role === 'user' ? (
                                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                    ) : (
                                        <ChatMarkdown content={m.content} />
                                    )}

                                    {/* Copy Action Button for Assistant Messages */}
                                    {m.role === 'assistant' && m.content && (
                                        <button
                                            onClick={() => handleCopyMessage(m.id, m.content)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                                            title="Copy response"
                                        >
                                            {copiedMsgId === m.id ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading Streaming Indicator */}
                        {isLoading && (
                            <div className="flex gap-3 justify-start items-center">
                                <div className="w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center shrink-0">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                </div>
                                <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-2 text-xs text-muted-foreground shadow-2xs">
                                    <span>Retrieving context chunks and generating answer...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Bar */}
                <div className="p-3 sm:p-4 border-t border-border bg-card sticky bottom-0 z-10">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about this article..."
                            className="flex-1 h-9.5 text-sm bg-background border-border"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="h-9.5 px-4 text-xs font-medium shrink-0"
                        >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            Send
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
