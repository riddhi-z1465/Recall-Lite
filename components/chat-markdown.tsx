'use client';

import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';

interface ChatMarkdownProps {
    content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
    if (!content) return null;

    // Helper to render inline markdown (bold, italic, code, links)
    const parseInline = (text: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        // Regex for bold, italic, code, links
        const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            const str = match[0];
            if (str.startsWith('**') && str.endsWith('**')) {
                parts.push(
                    <strong key={match.index} className="font-semibold text-foreground">
                        {str.slice(2, -2)}
                    </strong>
                );
            } else if (str.startsWith('*') && str.endsWith('*')) {
                parts.push(
                    <em key={match.index} className="italic">
                        {str.slice(1, -1)}
                    </em>
                );
            } else if (str.startsWith('`') && str.endsWith('`')) {
                parts.push(
                    <code
                        key={match.index}
                        className="px-1.5 py-0.5 rounded bg-muted font-mono text-[12px] text-indigo-500 dark:text-indigo-300 border border-border/40"
                    >
                        {str.slice(1, -1)}
                    </code>
                );
            } else if (str.startsWith('[') && str.includes('](')) {
                const linkMatch = str.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    parts.push(
                        <a
                            key={match.index}
                            href={linkMatch[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-500 hover:underline inline-flex items-center gap-0.5 font-medium"
                        >
                            {linkMatch[1]}
                            <ExternalLink className="w-3 h-3 inline shrink-0" />
                        </a>
                    );
                }
            }
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts;
    };

    // Split content into blocks (code blocks vs paragraphs/lists)
    const blocks = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="space-y-3 text-sm leading-relaxed">
            {blocks.map((block, blockIdx) => {
                if (block.startsWith('```') && block.endsWith('```')) {
                    // Code Block
                    const firstLineEnd = block.indexOf('\n');
                    let language = 'code';
                    let codeText = '';

                    if (firstLineEnd !== -1) {
                        language = block.substring(3, firstLineEnd).trim() || 'code';
                        codeText = block.substring(firstLineEnd + 1, block.length - 3);
                    } else {
                        codeText = block.substring(3, block.length - 3);
                    }

                    return <CodeBlock key={blockIdx} code={codeText} language={language} />;
                }

                // Normal Text Block (Split by newlines to handle headings, lists, blockquotes)
                const lines = block.split('\n');
                const renderedLines: React.ReactNode[] = [];
                let currentList: React.ReactNode[] = [];

                lines.forEach((line, lineIdx) => {
                    const trimmed = line.trim();

                    // Heading 1, 2, 3
                    if (trimmed.startsWith('# ')) {
                        renderedLines.push(
                            <h1 key={`h1-${lineIdx}`} className="text-xl font-extrabold text-foreground tracking-tight pt-2">
                                {parseInline(trimmed.substring(2))}
                            </h1>
                        );
                    } else if (trimmed.startsWith('## ')) {
                        renderedLines.push(
                            <h2 key={`h2-${lineIdx}`} className="text-lg font-bold text-foreground tracking-tight pt-2">
                                {parseInline(trimmed.substring(3))}
                            </h2>
                        );
                    } else if (trimmed.startsWith('### ')) {
                        renderedLines.push(
                            <h3 key={`h3-${lineIdx}`} className="text-base font-semibold text-foreground pt-1">
                                {parseInline(trimmed.substring(4))}
                            </h3>
                        );
                    }
                    // Bullet list item
                    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        currentList.push(
                            <li key={`li-${lineIdx}`} className="ml-4 list-disc pl-1">
                                {parseInline(trimmed.substring(2))}
                            </li>
                        );
                    }
                    // Numbered list item
                    else if (/^\d+\.\s/.test(trimmed)) {
                        const contentText = trimmed.replace(/^\d+\.\s/, '');
                        currentList.push(
                            <li key={`nli-${lineIdx}`} className="ml-4 list-decimal pl-1">
                                {parseInline(contentText)}
                            </li>
                        );
                    }
                    // Blockquote
                    else if (trimmed.startsWith('> ')) {
                        renderedLines.push(
                            <blockquote
                                key={`bq-${lineIdx}`}
                                className="pl-3 border-l-2 border-indigo-500 text-muted-foreground italic my-1"
                            >
                                {parseInline(trimmed.substring(2))}
                            </blockquote>
                        );
                    }
                    // Standard Paragraph
                    else if (trimmed.length > 0) {
                        // Flush any pending list
                        if (currentList.length > 0) {
                            renderedLines.push(
                                <ul key={`ul-${lineIdx}`} className="space-y-1 my-1 text-foreground/90">
                                    {currentList}
                                </ul>
                            );
                            currentList = [];
                        }

                        renderedLines.push(
                            <p key={`p-${lineIdx}`} className="my-1">
                                {parseInline(trimmed)}
                            </p>
                        );
                    }
                });

                // Flush remaining list
                if (currentList.length > 0) {
                    renderedLines.push(
                        <ul key={`ul-end-${blockIdx}`} className="space-y-1 my-1 text-foreground/90">
                            {currentList}
                        </ul>
                    );
                }

                return <div key={blockIdx}>{renderedLines}</div>;
            })}
        </div>
    );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className="relative my-3 rounded-lg overflow-hidden border border-border/60 bg-slate-950 text-slate-100 font-mono text-xs shadow-md">
            <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-slate-200 transition-colors p-1 rounded"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-sans">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="font-sans">Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed font-mono">
                <code>{code}</code>
            </pre>
        </div>
    );
}
