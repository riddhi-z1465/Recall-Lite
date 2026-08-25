'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { AddLinkForm } from '@/components/add-link-form';
import { DocumentCard } from '@/components/document-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LayoutGrid, List, BookOpen, Clock, Globe, ArrowUpDown, Bookmark, X } from 'lucide-react';
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
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut to focus search input: '/'
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Calculate knowledge statistics & unique domains
    const { stats, uniqueDomains } = useMemo(() => {
        const totalDocs = documents.length;
        let totalWords = 0;
        const domainCounts = new Map<string, number>();

        documents.forEach((doc) => {
            if (doc.excerpt) {
                totalWords += doc.excerpt.split(/\s+/).filter(Boolean).length;
            }
            if (doc.url) {
                try {
                    const host = new URL(doc.url).hostname.replace('www.', '');
                    domainCounts.set(host, (domainCounts.get(host) || 0) + 1);
                } catch {
                    // Ignore invalid URL
                }
            }
        });

        const estimatedReadMinutes = Math.max(1, Math.ceil(totalWords / 200));

        return {
            stats: {
                totalDocs,
                totalDomains: domainCounts.size,
                estimatedReadMinutes,
            },
            uniqueDomains: Array.from(domainCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([domain, count]) => ({ domain, count })),
        };
    }, [documents]);

    // Filter and sort documents
    const filteredDocuments = useMemo(() => {
        const result = documents.filter((doc) => {
            // Filter by selected domain
            if (selectedDomain && doc.url) {
                try {
                    const host = new URL(doc.url).hostname.replace('www.', '');
                    if (host !== selectedDomain) return false;
                } catch {
                    return false;
                }
            } else if (selectedDomain && !doc.url) {
                return false;
            }

            // Filter by search query
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
    }, [documents, searchQuery, selectedDomain, sortBy]);

    return (
        <div className="min-h-full bg-background flex flex-col">
            {/* Top Bar */}
            <header className="sticky top-0 z-20 border-b border-border bg-card px-4 sm:px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center p-1.5 rounded-md border border-border bg-card">
                        <Bookmark className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <span className="font-semibold text-sm text-foreground">
                            Recall Lite
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            <div className="container mx-auto py-6 px-4 max-w-5xl space-y-6">
                {/* Header info strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Saved Articles & Docs
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Extract content, search with vector similarity, and query using local document context.
                        </p>
                    </div>

                    {/* Stats strip */}
                    <div className="flex items-center gap-2 text-xs">
                        <div className="px-3 py-1.5 rounded-md border border-border bg-card flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-mono font-medium text-foreground">{stats.totalDocs}</span>
                            <span className="text-muted-foreground text-[11px]">articles</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-md border border-border bg-card flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-mono font-medium text-foreground">{stats.estimatedReadMinutes}m</span>
                            <span className="text-muted-foreground text-[11px]">read time</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-md border border-border bg-card flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-mono font-medium text-foreground">{stats.totalDomains}</span>
                            <span className="text-muted-foreground text-[11px]">sources</span>
                        </div>
                    </div>
                </div>

                {/* Add Link Form */}
                <AddLinkForm />

                {/* Search, Filter & Layout Toolbar */}
                <div className="space-y-2.5 pt-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search articles... (Press / to focus)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8.5 pr-8 h-9 text-xs bg-card border-border"
                            />
                            {searchQuery ? (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded pointer-events-none hidden sm:inline-block">
                                    /
                                </kbd>
                            )}
                        </div>

                        <div className="flex items-center gap-2 justify-between sm:justify-end">
                            {/* Sort selector */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ArrowUpDown className="w-3 h-3" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                                    className="bg-card border border-border rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                    <option value="title">Alphabetical (A-Z)</option>
                                </select>
                            </div>

                            {/* View Toggle Buttons */}
                            <div className="flex items-center p-0.5 bg-muted rounded-md border border-border">
                                <Button
                                    size="icon"
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    className="h-7 w-7 rounded"
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    className="h-7 w-7 rounded"
                                    onClick={() => setViewMode('list')}
                                    title="List view"
                                >
                                    <List className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Domain Filter Pills */}
                    {uniqueDomains.length > 1 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                            <span className="text-[11px] text-muted-foreground shrink-0 mr-0.5">Filter by source:</span>
                            <button
                                onClick={() => setSelectedDomain(null)}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors shrink-0 ${selectedDomain === null
                                        ? 'bg-primary text-primary-foreground font-medium'
                                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                All ({documents.length})
                            </button>
                            {uniqueDomains.map(({ domain, count }) => (
                                <button
                                    key={domain}
                                    onClick={() => setSelectedDomain(selectedDomain === domain ? null : domain)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors shrink-0 ${selectedDomain === domain
                                            ? 'bg-primary text-primary-foreground font-medium'
                                            : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {domain} ({count})
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Documents Grid / List */}
                {filteredDocuments.length > 0 ? (
                    <div className={
                        viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            : "flex flex-col gap-2"
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
                    <div className="text-center py-12 px-4 border border-dashed border-border rounded-lg bg-card/40 space-y-3">
                        <div className="w-10 h-10 mx-auto rounded-md border border-border bg-card flex items-center justify-center">
                            <Search className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-sm text-foreground">
                                {searchQuery || selectedDomain ? 'No matching articles' : 'No articles saved yet'}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                {searchQuery || selectedDomain
                                    ? 'No articles match your current search or domain filter.'
                                    : 'Paste any article or documentation URL above to scrape its text and query it.'}
                            </p>
                        </div>
                        {(searchQuery || selectedDomain) && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedDomain(null);
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
