import Link from 'next/link';
import type { Metadata } from 'next';

import Header from '@/components/Header';
import { linkAnchorStyle } from '@/data/styles';



export const metadata: Metadata = {
    title: 'not found',
    description: 'this URL is outside the narrative',
};


export default function NotFound() {
    return (
        <div className="flex flex-col items-center w-full min-h-screen p-8">
            <Header />

            <div className="flex flex-col items-center justify-center grow text-center max-w-xl">
                <div className="text-7xl font-bold mb-6 select-none">
                    404
                </div>

                <p className="text-lg mb-10">
                    this URL is outside the narrative
                </p>

                <Link
                    href="/"
                    className={linkAnchorStyle}
                >
                    return to piatra.institute
                </Link>
            </div>
        </div>
    );
}
