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
                    className="m-2 mx-2 p-2 bg-lime-50 text-black uppercase text-base font-bold sm:text-2xl sm:mx-8"
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
                        <>
                            <Link
                                key={`${href}${label}`}
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
                        </>
                    ))}
                </div>
            </div>
        </main>
    );
}
