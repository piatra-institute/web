import type { Metadata } from 'next';
import Link from 'next/link';

import {
    linkAnchorStyle,
} from '@/data/styles';

import Header from '@/components/Header';



export const metadata: Metadata = {
    title: 'papers',
};


const papers: ({
    title: string;
    path: string;
})[] = [
];


export default function Papers() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full select-none"
        >
            <Header />

            <h1
                className="text-xl font-bold mb-10"
            >
                papers
            </h1>

            <div
                className="p-6"
            >
                {papers.map((paper) => (
                    <Link
                        key={paper.path}
                        href={`/papers/${paper.path}`}
                        className={linkAnchorStyle}
                    >
                        {paper.title}
                    </Link>
                ))}
            </div>
        </div>
    );
}
