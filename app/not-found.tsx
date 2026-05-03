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
        <div className="relative w-full min-h-screen flex items-center justify-center bg-black">
            <div className="relative z-10 text-center px-8 py-16">
                <div className="mb-12">
                    <Header />
                </div>

                <div className="flex flex-col items-center max-w-xl mx-auto">
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
        </div>
    );
}
