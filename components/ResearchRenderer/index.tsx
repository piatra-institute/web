'use client';

import { useCallback, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PRINT_STYLES = `
@media print {
    body {
        background: white !important;
        color: black !important;
    }
    .no-print {
        display: none !important;
    }
    .research-content h1,
    .research-content h2,
    .research-content h3 {
        color: black !important;
    }
    .research-content p,
    .research-content li,
    .research-content blockquote {
        color: #333 !important;
    }
    .research-content a {
        color: #1a5c00 !important;
        text-decoration: underline !important;
    }
    .research-content pre,
    .research-content code {
        background: #f5f5f5 !important;
        border-color: #ccc !important;
        color: #333 !important;
    }
    .research-content blockquote {
        border-color: #666 !important;
    }
    .research-content table {
        border-color: #ccc !important;
    }
    .research-content th,
    .research-content td {
        border-color: #ccc !important;
        color: #333 !important;
    }
    .research-content th {
        background: #f0f0f0 !important;
    }
}
`;

interface ResearchRendererProps {
    content: string;
}

export default function ResearchRenderer({ content }: ResearchRendererProps) {
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = PRINT_STYLES;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <>
            <div className="no-print flex justify-end mb-8">
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-sm text-lime-400 border border-lime-500/30 hover:border-lime-500 hover:bg-lime-500/10 transition-colors cursor-pointer"
                >
                    Export PDF
                </button>
            </div>

            <div className="research-content">
                <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({ children }) => (
                            <h1 className="text-3xl font-serif text-white mt-12 mb-6 first:mt-0">
                                {children}
                            </h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="text-2xl font-serif text-lime-400 mt-10 mb-4">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="text-xl font-serif text-lime-400 mt-8 mb-3">
                                {children}
                            </h3>
                        ),
                        h4: ({ children }) => (
                            <h4 className="text-lg font-serif text-lime-400/80 mt-6 mb-2">
                                {children}
                            </h4>
                        ),
                        p: ({ children }) => (
                            <p className="text-gray-300 font-serif text-base leading-relaxed mb-4">
                                {children}
                            </p>
                        ),
                        a: ({ href, children }) => (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lime-400 hover:text-lime-300 underline underline-offset-2 decoration-lime-500/30 hover:decoration-lime-400 transition-colors"
                            >
                                {children}
                            </a>
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-lime-500/50 pl-4 my-4 italic text-gray-400">
                                {children}
                            </blockquote>
                        ),
                        ul: ({ children }) => (
                            <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-gray-300 font-serif">
                                {children}
                            </ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-gray-300 font-serif">
                                {children}
                            </ol>
                        ),
                        li: ({ children }) => (
                            <li className="leading-relaxed">{children}</li>
                        ),
                        code: ({ className, children }) => {
                            const isBlock = className?.includes('language-');
                            if (isBlock) {
                                return (
                                    <code className="text-sm text-lime-200/80">
                                        {children}
                                    </code>
                                );
                            }
                            return (
                                <code className="bg-[#0a0a0a] border border-lime-500/20 px-1.5 py-0.5 text-sm text-lime-300 font-mono">
                                    {children}
                                </code>
                            );
                        },
                        pre: ({ children }) => (
                            <pre className="bg-[#0a0a0a] border border-lime-500/20 p-4 my-4 overflow-x-auto text-sm font-mono">
                                {children}
                            </pre>
                        ),
                        hr: () => (
                            <hr className="border-lime-500/20 my-8" />
                        ),
                        strong: ({ children }) => (
                            <strong className="text-lime-100 font-semibold">{children}</strong>
                        ),
                        em: ({ children }) => (
                            <em className="text-gray-200">{children}</em>
                        ),
                        table: ({ children }) => (
                            <div className="overflow-x-auto my-6">
                                <table className="w-full border-collapse border border-lime-500/20 text-sm">
                                    {children}
                                </table>
                            </div>
                        ),
                        thead: ({ children }) => (
                            <thead className="bg-lime-500/10">{children}</thead>
                        ),
                        th: ({ children }) => (
                            <th className="border border-lime-500/20 px-3 py-2 text-left text-lime-200 font-serif">
                                {children}
                            </th>
                        ),
                        td: ({ children }) => (
                            <td className="border border-lime-500/20 px-3 py-2 text-gray-300 font-serif">
                                {children}
                            </td>
                        ),
                    }}
                >
                    {content}
                </Markdown>
            </div>
        </>
    );
}
