import type { Metadata } from 'next';

import Header from '@/components/Header';
import Title from '@/components/Title';



export const metadata: Metadata = {
    title: 'self-sorted arrays · playgrounds',
};


export default function SelfSortedArrays() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="self-sorted arrays"
            />
        </div>
    );
}
