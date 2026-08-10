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
    LayoutDashboard,
    Plus,
    MessageSquare,
    Brain,
    Sparkles,
    Copy,
    Check,
    ExternalLink,
    Globe
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
    { label: '⚡ 3-Point Summary', prompt: 'Summarize the top 3 key takeaways from this document in clear bullet points.' },
    { label: '💡 Main Takeaways', prompt: 'What are the main arguments and conclusions presented in this article?' },
    { label: '❓ Key Q&As', prompt: 'List 3 important questions this document answers, along with concise answers.' },
    { label: '📝 Action Items', prompt: 'Extract any practical advice, steps, or actionable insights mentioned in this text.' },
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
                        content: `⚠️ ${errorText || 'Sorry, there was an error processing your request.'}`,
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
                    content: `⚠️ ${error?.message || 'Sorry, there was an error processing your request.'}`,
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
        <div className="flex flex-col h-full w-full bg-background selection:bg-indigo-500/20">
            {/* Header with Active Document Context */}
            <header className="flex items-center justify-between p-3 md:px-6 border-b border-border/60 bg-card/60 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-accent shrink-0">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold truncate max-w-xs sm:max-w-md" title={currentDoc?.title}>
                                {currentDoc?.title || 'Chat with Article'}
                            </h1>
                            {domainHost && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 hidden sm:inline-block">
                                    {domainHost}
                                </span>
                            )}
                        </div>
                        {currentDoc?.url && (
                            <a
                                href={currentDoc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-muted-foreground hover:text-indigo-500 flex items-center gap-1 truncate"
                            >
                                <span className="truncate max-w-xs">{currentDoc.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <ThemeToggle />

                    {/* Mobile Drawer trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0">
                            <div className="flex flex-col h-full bg-sidebar/95 backdrop-blur-xl">
                                <div className="p-4 border-b border-sidebar-border h-14 flex items-center justify-between">
                                    <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold">
                                        <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                                            <Brain className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold text-lg">
                                            Recall Lite
                                        </span>
                                    </Link>
                                </div>

                                <div className="p-3">
                                    <Link href="/dashboard">
                                        <Button
                                            className="w-full justify-start bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold rounded-xl h-10 text-xs"
                                        >
                                            <LayoutDashboard className="w-4 h-4 mr-2 text-indigo-500" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                </div>

                                <div className="px-5 py-1.5 flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Knowledge Base
                                    </h4>
                                    {documents && documents.length > 0 && (
                                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                                            {documents.length}
                                        </span>
                                    )}
                                </div>

                                <ScrollArea className="flex-1 px-2">
                                    <div className="space-y-1 p-1">
                                        {documents.map((doc) => {
                                            const isSelected = documentId === doc.id;
                                            return (
                                                <Link key={doc.id} href={`/chat/${doc.id}`}>
                                                    <div
                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                                                            isSelected
                                                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500'
                                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/80'
                                                        }`}
                                                    >
                                                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-500' : 'text-muted-foreground'}`} />
                                                        <span className="truncate">{doc.title}</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>

                                <div className="p-3 border-t border-sidebar-border mt-auto">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="truncate">{userEmail}</span>
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
                    <div className="space-y-6 max-w-3xl mx-auto pb-24">
                        {/* Empty State / Starter Suggestions */}
                        {messages.length === 0 && (
                            <div className="text-center space-y-6 my-12 animate-in fade-in zoom-in-95 duration-300">
                                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/20 shadow-lg">
                                    <Brain className="w-8 h-8 text-indigo-500" />
                                </div>
                                <div className="space-y-2 max-w-md mx-auto">
                                    <h3 className="text-lg font-bold">Ask anything about this article</h3>
                                    <p className="text-xs text-muted-foreground">
                                        AI has indexed the content of this document. Pick a starter prompt or type your custom question below.
                                    </p>
                                </div>

                                {/* Starter Chips */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto pt-2">
                                    {STARTER_PROMPTS.map((starter) => (
                                        <button
                                            key={starter.label}
                                            type="button"
                                            onClick={() => handleSendMessage(starter.prompt)}
                                            className="p-3 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/80 hover:border-indigo-500/40 transition-all duration-200 text-left space-y-1 shadow-sm hover:shadow group"
                                        >
                                            <div className="text-xs font-semibold group-hover:text-indigo-500 transition-colors">
                                                {starter.label}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground line-clamp-1">
                                                {starter.prompt}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message History */}
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                            >
                                {/* Assistant Avatar */}
                                {m.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md mt-1">
                                        <Brain className="w-4 h-4" />
                                    </div>
                                )}

                                <div
                                    className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-sm ${
                                        m.role === 'user'
                                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-br-xs'
                                            : 'bg-card border border-border/60 text-card-foreground rounded-bl-xs'
                                    }`}
                                >
                                    {m.role === 'user' ? (
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                                    ) : (
                                        <ChatMarkdown content={m.content} />
                                    )}

                                    {/* Copy Action Button for Assistant Messages */}
                                    {m.role === 'assistant' && m.content && (
                                        <button
                                            onClick={() => handleCopyMessage(m.id, m.content)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                                            title="Copy response"
                                        >
                                            {copiedMsgId === m.id ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
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
                            <div className="flex gap-3 justify-start items-center animate-pulse">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                    <Brain className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                                </div>
                                <div className="bg-card border border-border/60 rounded-2xl rounded-bl-xs p-4 flex items-center gap-1.5 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    <span className="text-xs text-muted-foreground ml-2">Reading document context...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Bar */}
                <div className="p-4 border-t border-border/60 bg-card/80 backdrop-blur-md sticky bottom-0 z-10">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about this article..."
                            className="flex-1 h-11 bg-background/60 focus:bg-background border-border/60 focus:border-indigo-500/50 transition-all text-sm rounded-xl"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
