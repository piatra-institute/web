import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import PressTitle from './components/PressTitle';



export const metadata: Metadata = {
    title: 'press',
};


const pressItems = [
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
        translation: 'Lucrurile vii nu sunt mașini (din secolul al XX-lea): Actualizarea metaforelor mecaniciste în lumina științei moderne a comportamentului mașinal',
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
                {pressItems.map((pressItem) => {
                    const {
                        link,
                        title,
                    } = pressItem;

                    return (
                        <Link
                            key={title + link}
                            href={link}
                            className="max-w-[600px] mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center p-3"
                        >
                            <PressTitle
                                {...pressItem}
                            />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
