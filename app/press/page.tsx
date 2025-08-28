import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import PressTitle from './components/PressTitle';

import {
    getPressItems,
} from './logic';

import { ExternalLink } from 'lucide-react';



export const metadata: Metadata = {
    title: 'press',
};


const otherPress = [
    {
        link: 'https://github.com/piatra-institute/deep-representation-learning-book',
        title: 'Învățarea Reprezentărilor Profunde ale Distribuțiilor de Date',
        originalTitle: 'Learning Deep Representations of Data Distributions',
        authors: 'Sam Buchanan, Druv Pai, Peng Wang, Yi Ma',
        year: '2025',
        doi: 'https://doi.org/10.5281/zenodo.16982585'
    }
];


export default function Press() {
    const pressItems = getPressItems();

    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="press"
            />

            <div
                className="p-6"
            >
                {pressItems.map((pressItem) => {
                    const {
                        link,
                        title,
                    } = pressItem.details;

                    return (
                        <Link
                            key={title + link}
                            href={link}
                            className="max-w-[600px] mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center p-3"
                        >
                            <PressTitle
                                {...pressItem.details}
                            />
                        </Link>
                    );
                })}

                {otherPress.map((item) => (
                    <div
                        key={item.title + item.link}
                        className="max-w-[600px] mb-8 block text-center p-3 border border-transparent hover:border-lime transition-colors"
                    >
                        {item.year && (
                            <div className="text-white text-sm mb-2">
                                {item.year}
                            </div>
                        )}

                        <div className="font-bold mb-2">
                            {item.title}
                        </div>

                        {item.authors && (
                            <div className="text-white text-sm my-2">
                                {item.authors}
                            </div>
                        )}

                        {item.originalTitle && (
                            <div className="text-white text-sm opacity-70">
                                {item.originalTitle}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-4 mt-3">
                            <a
                                href={item.link}
                                className="inline-flex items-center gap-1 text-lime hover:underline text-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>GitHub</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>

                            {item.doi && (
                                <a
                                    href={item.doi}
                                    className="inline-flex items-center gap-1 text-lime hover:underline text-sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span>DOI: {item.doi.replace('https://doi.org/', '')}</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
