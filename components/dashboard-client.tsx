'use client';

import { useState, useMemo } from 'react';
import { AddLinkForm } from '@/components/add-link-form';
import { DocumentCard } from '@/components/document-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LayoutGrid, List, Brain, Sparkles, BookOpen, Clock, Globe, ArrowUpDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface DocumentItem {
    id: string;
    title: string;
    url?: string | null;
    excerpt?: string | null;
    created_at: string;
}

interface DashboardClientProps {
    documents: DocumentItem[];
    userEmail?: string;
}

export function DashboardClient({ documents }: DashboardClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

    // Calculate knowledge statistics
    const stats = useMemo(() => {
        const totalDocs = documents.length;
        let totalWords = 0;
        const domainSet = new Set<string>();

        documents.forEach((doc) => {
            if (doc.excerpt) {
                totalWords += doc.excerpt.split(/\s+/).filter(Boolean).length;
            }
            if (doc.url) {
                try {
                    const host = new URL(doc.url).hostname.replace('www.', '');
                    domainSet.add(host);
                } catch (e) {
                    // Ignore invalid URL
                }
            }
        });

        // Roughly estimate 200 words per minute read time
        const estimatedReadMinutes = Math.max(1, Math.ceil(totalWords / 200));

        return {
            totalDocs,
            totalDomains: domainSet.size,
            estimatedReadMinutes,
        };
    }, [documents]);

    // Filter and sort documents
    const filteredDocuments = useMemo(() => {
        let result = documents.filter((doc) => {
            const query = searchQuery.toLowerCase().trim();
            if (!query) return true;
            return (
                doc.title?.toLowerCase().includes(query) ||
                doc.url?.toLowerCase().includes(query) ||
                doc.excerpt?.toLowerCase().includes(query)
            );
        });

        return result.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortBy === 'oldest') {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            } else {
                return a.title.localeCompare(b.title);
            }
        });
    }, [documents, searchQuery, sortBy]);

    return (
        <div className="min-h-full bg-background selection:bg-indigo-500/20">
            {/* Top Bar for Desktop/Mobile */}
            <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                        <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <Sparkles className="w-2.5 h-2.5 absolute -top-1 -right-1 text-pink-500" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Recall Lite
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
                {/* Hero Header Section */}
                <div className="text-center space-y-3 relative">
                    <div className="absolute inset-x-0 -top-10 h-32 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none rounded-full" />
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Your Knowledge Hub
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                        Save web articles, extract smart summaries, and chat directly with your second brain.
                    </p>
                </div>

                {/* Knowledge Stats Banner */}
                <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalDocs}</p>
                            <p className="text-xs text-muted-foreground">Saved Items</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.estimatedReadMinutes} <span className="text-xs font-normal text-muted-foreground">min</span></p>
                            <p className="text-xs text-muted-foreground">Est. Read Time</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalDomains}</p>
                            <p className="text-xs text-muted-foreground">Sources</p>
                        </div>
                    </div>
                </div>

                {/* Add Link Form */}
                <AddLinkForm />

                {/* Search & Layout Control Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search saved articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-card/60 border-border/60 focus:border-indigo-500/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Sort selector */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <select
                                value={sortBy}
                                onChange={(e: any) => setSortBy(e.target.value)}
                                className="bg-card/60 border border-border/60 rounded-md px-2 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title">By Title</option>
                            </select>
                        </div>

                        {/* Grid / List View Toggle Buttons */}
                        <div className="flex items-center p-1 bg-muted/60 rounded-lg border border-border/40">
                            <Button
                                size="icon"
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                className="h-7 w-7 rounded-md"
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                className="h-7 w-7 rounded-md"
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Documents Grid / List */}
                {filteredDocuments.length > 0 ? (
                    <div className={
                        viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            : "flex flex-col gap-3"
                    }>
                        {filteredDocuments.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                id={doc.id}
                                title={doc.title}
                                url={doc.url}
                                excerpt={doc.excerpt || ''}
                                createdAt={doc.created_at}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed border-border/60 rounded-2xl bg-card/30 backdrop-blur-sm space-y-4">
                        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                            <Search className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">
                                {searchQuery ? 'No matching documents found' : 'Your library is empty'}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                {searchQuery
                                    ? `No articles match "${searchQuery}". Try clearing your search filter.`
                                    : 'Paste any web article URL above to scrape its content and start chatting with it!'}
                            </p>
                        </div>
                        {searchQuery && (
                            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                                Reset Search Filter
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
