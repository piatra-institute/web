import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import {
    linkAnchorStyle,
} from '@/data/styles';



export const metadata: Metadata = {
    title: 'platforms',
};


const platforms = [
    {
        name: 'ordershop . io',
        description: 'platform to request and manage manufacturing orders',
        link: 'https://github.com/piatra-institute/ordershop',
    },
    {
        name: 'sonocracy . com',
        description: 'platform to vote for volume control and bid for songs in venues',
        link: 'https://github.com/piatra-institute/sonocracy',
    },
    {
        name: 'xfactura . ro',
        description: 'platform for einvoicing and general accounting following the Romanian/EU legislation',
        link: 'https://github.com/piatra-institute/xfactura-ro',
    },
];


export default function Platforms() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="platforms"
            />

            <div
                className="p-6 w-full max-w-lg"
            >
                {platforms.map((platform) => {
                    const {
                        name,
                        description,
                        link,
                    } = platform;

                    return (
                        <Link
                            key={name + link}
                            href={link}
                            target="_blank"
                            className="mb-8 p-1 block focus:outline-none focus:ring-1 focus:ring-white"
                        >
                            <div
                                className={linkAnchorStyle}
                            >
                                {name}
                            </div>

                            <div
                                className="text-sm p-1 pt-1"
                            >
                                {description}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
