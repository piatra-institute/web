import React from 'react';

import Link from 'next/link';
import Image from 'next/image';

import {
    linkButtonStyle,
} from '@/data/styles';



const links = [
    {
        href: '/platforms',
        label: 'platforms',
    },
    {
        href: '/provocations',
        label: 'provocations',
    },
    {
        href: '/papers',
        label: 'papers',
    },
    {
        href: '/playgrounds',
        label: 'playgrounds',
    },
    {
        href: '/press',
        label: 'press',
    },
];


export default function Home() {
    return (
        <main className="md:h-screen flex items-center justify-center p-10 select-none overflow-scroll">
            <div className="max-w-5xl w-full items-center justify-center grid text-center text-lime-50">
                <Image
                    src="/piatra-institute.png"
                    height={450}
                    width={450}
                    alt="piatra.institute"
                    className="pointer-events-none justify-self-center"
                    priority
                />

                <h1
                    className="w-full sm:w-auto sm:min-w-[360px] sm:max-w-[400px] p-2 bg-lime-50 text-black uppercase text-base font-bold sm:text-2xl my-4 mx-auto sm:my-4 sm:mx-auto"
                >
                    piatra . institute
                </h1>

                <h2
                    className="text-xs my-2"
                >
                    Piatra Institute of Arts & Technologies Recursively Applied
                </h2>

                <div
                    className="p-4"
                >
                    <p className="m-1">
                        <span className="text-sm uppercase">love</span> <span className="text-emerald-500">for the other</span>
                    </p>

                    <p className="m-1">
                        <span className="text-sm uppercase">care</span> <span className="text-emerald-500">for the world</span>
                    </p>

                    <p className="m-1">
                        <span className="text-sm uppercase">& deep research</span>
                    </p>
                </div>

                <div
                    className="flex flex-col md:flex-row justify-center space-x-1 md:space-x-3"
                >
                    {links.map(({ href, label }, index) => (
                        <React.Fragment
                            key={Math.random().toString()}
                        >
                            <Link
                                href={href}
                                className={linkButtonStyle}
                            >
                                {label}
                            </Link>

                            {index < links.length - 1 && (
                                <div
                                    key={Math.random().toString()}
                                >
                                    ·
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </main>
    );
}
