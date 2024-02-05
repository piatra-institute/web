import Link from 'next/link';
import Image from 'next/image';

import {
    linkButtonStyle,
} from '@/data/styles';



export default function Home() {
    return (
        <main className="h-screen flex items-center justify-center p-10 select-none">
            <div className="max-w-5xl w-full items-center justify-center grid text-center text-lime-50">
                <Image
                    src="/piatra-institute.png"
                    height={450}
                    width={450}
                    alt="piatra.institute"
                    className="pointer-events-none justify-self-center mt-4"
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
                    className="flex flex-row justify-center space-x-3"
                >
                    <Link
                        href="/platforms"
                        className={linkButtonStyle}
                    >
                        platforms
                    </Link>

                    <div>
                        ·
                    </div>

                    <Link
                        href="/papers"
                        className={linkButtonStyle}
                    >
                        papers
                    </Link>

                    <div>
                        ·
                    </div>

                    <Link
                        href="/provocations"
                        className={linkButtonStyle}
                    >
                        provocations
                    </Link>
                </div>
            </div>
        </main>
    );
}
