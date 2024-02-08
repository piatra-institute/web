import type { Metadata } from 'next';
import Link from 'next/link';

import {
    linkAnchorStyle,
} from '@/data/styles';

import Header from '@/components/Header';



export const metadata: Metadata = {
    title: 'platforms',
};


const platforms = [
    {
        name: 'sonocracy',
        description: 'platform to vote for volume control in venues, bid for songs',
        link: 'https://github.com/piatra-institute/sonocracy',
    },
    {
        name: 'xfactura-ro',
        description: 'platform for einvoicing following the Romanian/EU legislation',
        link: 'https://github.com/piatra-institute/xfactura-ro',
    },
];


export default function Platforms() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full select-none"
        >
            <Header />

            <h1
                className="text-md uppercase font-bold mb-10"
            >
                platforms
            </h1>

            <div
                className="p-6"
            >
                {platforms.map((platform) => {
                    const {
                        name,
                        description,
                        link,
                    } = platform;

                    return (
                        <div
                            key={name + link}
                            className="mb-8"
                        >
                            <h2
                                className="mb-2"
                            >
                                <Link
                                    href={link}
                                    target="_blank"
                                    className={linkAnchorStyle}
                                >
                                    {name}
                                </Link>
                            </h2>

                            <div
                                className="p-1"
                            >
                                {description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
