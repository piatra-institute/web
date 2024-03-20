import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import PressTitle from './components/PressTitle';

import {
    getPressItems,
} from './logic';



export const metadata: Metadata = {
    title: 'press',
};


export default function Press() {
    const pressItems = getPressItems();

    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="press"
            />

            <div
                className="p-6"
            >
                {pressItems.map((pressItem) => {
                    const {
                        link,
                        title,
                    } = pressItem.details;

                    return (
                        <Link
                            key={title + link}
                            href={link}
                            className="max-w-[600px] mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center p-3"
                        >
                            <PressTitle
                                {...pressItem.details}
                            />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
