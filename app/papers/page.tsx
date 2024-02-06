import type { Metadata } from 'next';
import Link from 'next/link';

import Header from '@/components/Header';

import {
    getPapers,
} from './logic';

import {
    renderDate,
} from '@/logic/utilities';



export const metadata: Metadata = {
    title: 'papers',
};


export default function Papers() {
    const papers = getPapers();

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
                {papers.map((paper) => {
                    const {
                        id,
                        path,
                        title,
                        abstract,
                        date,
                    } = paper;

                    return (
                        <Link
                            key={id}
                            href={`/papers/${path}`}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white"
                        >
                            <div
                                className="text-sm uppercase underline underline-offset-4 p-2 pb-0"
                            >
                                {renderDate(date)} · {title}
                            </div>

                            <div
                                className="text-sm p-2 pt-1"
                            >
                                {abstract}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
