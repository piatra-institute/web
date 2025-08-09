import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import {
    linkAnchorStyle,
} from '@/data/styles';

import {
    playgrounds,
} from './data';



export const metadata: Metadata = {
    title: 'playgrounds',
};


export default function Playgrounds() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="playgrounds"
            />

            <div
                className="max-w-[600px] text-center mb-4"
            >
                the playgrounds are in various stages of development
                <br />
                from conceptual sketches to fully functional applications
            </div>

            <div
                className="p-6"
            >
                {playgrounds.map((playground) => {
                    const {
                        name,
                        link,
                        description,
                        date,
                    } = playground;

                    return (
                        <Link
                            key={name + link}
                            href={link}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center"
                            draggable={false}
                        >
                            <div
                                className={linkAnchorStyle}
                            >
                                {name} · {date}
                            </div>

                            {description && (
                                <div>
                                    {description}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
