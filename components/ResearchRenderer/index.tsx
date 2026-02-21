'use client';

import { useCallback, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PRINT_STYLES = `
@page {
    margin: 3.5cm 2.5cm;
    size: A4;
}

@media print {
    *, *::before, *::after {
        background: transparent !important;
    }
    html, body {
        background: white !important;
        color: #1a1a1a !important;
        font-size: 11pt !important;
        line-height: 1.6 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        height: auto !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .no-print {
        display: none !important;
    }

    /* Reset wrapper layout for print */
    .min-h-screen {
        min-height: 0 !important;
    }
    .py-16 {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }

    /* Cover page */
    .research-cover {
        display: flex !important;
        color: #1a1a1a !important;
        page-break-after: always !important;
        break-after: page !important;
    }
    .research-cover .cover-logo {
        filter: grayscale(100%) contrast(1.2) !important;
    }

    /* Content area */
    .research-content {
        color: #1a1a1a !important;
    }

    /* Headings */
    .research-content h1 {
        font-size: 20pt !important;
        color: #000 !important;
        margin-top: 0 !important;
        margin-bottom: 16pt !important;
        line-height: 1.2 !important;
    }
    .research-content h2 {
        font-size: 15pt !important;
        color: #000 !important;
        margin-top: 24pt !important;
        margin-bottom: 10pt !important;
        line-height: 1.25 !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
    }
    .research-content h3 {
        font-size: 12pt !important;
        color: #1a1a1a !important;
        margin-top: 18pt !important;
        margin-bottom: 8pt !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
    }
    .research-content h4 {
        font-size: 11pt !important;
        color: #333 !important;
        margin-top: 14pt !important;
        margin-bottom: 6pt !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
    }

    /* Body text */
    .research-content p {
        color: #1a1a1a !important;
        font-size: 10.5pt !important;
        line-height: 1.65 !important;
        margin-bottom: 8pt !important;
        orphans: 3 !important;
        widows: 3 !important;
    }

    /* Links */
    .research-content a {
        color: #1a1a1a !important;
        text-decoration: underline !important;
        text-underline-offset: 2px !important;
    }

    /* Lists */
    .research-content ul,
    .research-content ol {
        color: #1a1a1a !important;
        font-size: 10.5pt !important;
        margin-bottom: 8pt !important;
        padding-left: 20pt !important;
    }
    .research-content li {
        color: #1a1a1a !important;
        line-height: 1.6 !important;
        margin-bottom: 3pt !important;
    }

    /* Blockquotes */
    .research-content blockquote {
        border-left: 2pt solid #999 !important;
        padding-left: 12pt !important;
        margin: 10pt 0 !important;
        color: #444 !important;
        font-style: italic !important;
    }
    .research-content blockquote p {
        color: #444 !important;
    }

    /* Code */
    .research-content pre {
        background: #f7f7f7 !important;
        border: 1px solid #ddd !important;
        padding: 10pt !important;
        margin: 10pt 0 !important;
        font-size: 9pt !important;
        line-height: 1.5 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
    .research-content code {
        background: #f0f0f0 !important;
        border: none !important;
        color: #333 !important;
        font-size: 9pt !important;
        padding: 1pt 3pt !important;
    }

    /* Bold and emphasis */
    .research-content strong {
        color: #000 !important;
        font-weight: 700 !important;
    }
    .research-content em {
        color: #1a1a1a !important;
    }

    /* Horizontal rules */
    .research-content hr {
        border: none !important;
        border-top: 0.5pt solid #ccc !important;
        margin: 20pt 0 !important;
    }

    /* Tables */
    .research-content table {
        border-collapse: collapse !important;
        width: 100% !important;
        font-size: 9.5pt !important;
        margin: 10pt 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
    .research-content th {
        background: #f0f0f0 !important;
        border: 0.5pt solid #ccc !important;
        padding: 5pt 8pt !important;
        color: #1a1a1a !important;
        font-weight: 600 !important;
        text-align: left !important;
    }
    .research-content td {
        border: 0.5pt solid #ccc !important;
        padding: 5pt 8pt !important;
        color: #1a1a1a !important;
    }
}
`;

interface ResearchRendererProps {
    content: string;
    title?: string;
}

export default function ResearchRenderer({ content, title }: ResearchRendererProps) {
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
            {title && (
                <div className="research-cover hidden flex-col items-center justify-center text-center" style={{ height: '100vh' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/piatra-institute.png"
                        alt="piatra.institute"
                        className="cover-logo"
                        style={{ width: 140, height: 140, marginBottom: 12 }}
                    />
                    <div style={{
                        fontSize: '13pt',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase' as const,
                        marginBottom: 80,
                    }}>
                        PIATRA . INSTITUTE
                    </div>
                    <div style={{
                        fontSize: '9pt',
                        fontWeight: 400,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase' as const,
                        color: '#888',
                        marginBottom: 16,
                    }}>
                        PLAYGROUND
                    </div>
                    <div className="font-serif" style={{
                        fontSize: '18pt',
                        fontWeight: 400,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase' as const,
                        maxWidth: 400,
                        lineHeight: 1.3,
                    }}>
                        {title}
                    </div>
                </div>
            )}

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
