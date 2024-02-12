import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import {
    linkAnchorStyle,
} from '@/data/styles';



export const metadata: Metadata = {
    title: 'playgrounds',
};


const platforms = [
    {
        name: 'self-sorted arrays',
        link: '/playgrounds/self-sorted-arrays',
    },
    // {
    //     name: 'vote no',
    //     link: '/playgrounds/vote-no',
    // },
];


export default function Playgrounds() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="platforms"
            />

            <div
                className="p-6"
            >
                {platforms.map((platform) => {
                    const {
                        name,
                        link,
                    } = platform;

                    return (
                        <Link
                            key={name + link}
                            href={link}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center"
                        >
                            <div
                                className={linkAnchorStyle}
                            >
                                {name}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
