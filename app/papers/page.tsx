import type { Metadata } from 'next';
import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';
import SubtitleDateable from '@/components/SubtitleDateable';

import {
    getPapers,
} from './logic';



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

            <Title
                text="papers"
            />

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
                            <SubtitleDateable
                                text={title}
                                date={date}
                            />

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
