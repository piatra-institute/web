import type { Metadata } from 'next';

import Header from '@/components/Header';



export const metadata: Metadata = {
    title: 'paper',
};


export default function Paper() {
    return (
        <div
            className="flex flex-col items-center w-full h-full p-8"
        >
            <Header />

            <h1
                className="text-xl font-bold mb-10"
            >
                paper
            </h1>
        </div>
    );
}
