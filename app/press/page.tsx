import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';



export const metadata: Metadata = {
    title: 'press',
};


const platforms = [
    {
        link: '/press/ro/living-things-are-not-20th-century-machines',
        authors: [
            'Joshua Bongard',
            'Michael Levin',
        ],
        metadata: '2021, Frontiers in Ecology and Evolution',
        title: 'Living Things Are Not (20th Century) Machines: Updating Mechanism Metaphors in Light of the Modern Science of Machine Behavior',
        year: '2024',
        language: 'Romanian',
        translation: 'Lucrurile vii nu sunt mașini (din secolul al XX-lea): Actualizarea metaforelor mecanistice în lumina științei moderne a comportamentului mașinal',
    },
];


export default function Press() {
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
                {platforms.map((platform) => {
                    const {
                        link,
                        authors,
                        metadata,
                        title,
                        year,
                        language,
                        translation,
                    } = platform;

                    return (
                        <Link
                            key={title + link}
                            href={link}
                            className="max-w-[600px] mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center p-4"
                        >
                            <div
                                className={'text-sm uppercase mb-2'}
                            >
                                {authors.join(', ')}
                            </div>

                            <div
                                className={'text-xs mb-2'}
                            >
                                {metadata}
                            </div>

                            <div
                                className={'text-xs text-left italic mb-2'}
                            >
                                {title}
                            </div>

                            <div
                                className={'text-base text-left mb-2'}
                            >
                                <span
                                    className={'text-xs uppercase'}
                                >
                                    {language} / {year} /
                                </span> {translation}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
