import React from 'react';

import Link from 'next/link';
import Image from 'next/image';

import {
    linkButtonStyle,
    focusStyle,
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
                    className="w-full sm:w-auto sm:min-w-[380px] sm:max-w-[400px] p-2 bg-lime-50 text-black uppercase text-base font-bold sm:text-2xl my-4 mx-auto sm:my-4 sm:mx-auto"
                >
                    piatra . institute
                </h1>

                <h2
                    className="text-xs my-2"
                >
                    Piatra Institute of Arts & Technologies Recursively Applied
                    <span
                        style={{
                            marginLeft: '0.1rem',
                            padding: '0.1rem',
                        }}
                    >
                        <a
                            href="mailto:contact@piatra.institute"
                            className={focusStyle}
                        >
                            <svg
                                width="14px" height="14px"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    display: 'inline',
                                    padding: '0.1rem',
                                }}
                            >
                                <path
                                    d="M22 2L2 8.66667L11.5833 12.4167M22 2L15.3333 22L11.5833 12.4167M22 2L11.5833 12.4167"
                                    stroke="#f7fee7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                />
                            </svg>
                        </a>
                    </span>
                </h2>

                <div
                    className="relative p-4"
                >
                    <p className="m-2">
                        <span className="text-sm uppercase">love</span> <span className="text-emerald-500"> <span
                            style={{
                                color: 'black'
                            }}
                        >for the</span> other</span>
                    </p>

                    <p
                        className="absolute text-emerald-500"
                        style={{
                            top: '42px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    >
                        for the
                    </p>

                    <p className="m-1">
                        <span className="text-sm uppercase">care</span> <span className="text-emerald-500"> <span
                            style={{
                                color: 'black'
                            }}
                        >for the</span> world</span>
                    </p>

                    <p className="m-1">
                        <span className="text-sm uppercase">&&nbsp;&nbsp;&nbsp;deep research</span>
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
