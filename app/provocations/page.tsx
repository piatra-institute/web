import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';
import SubtitleDateable from '@/components/SubtitleDateable';

import {
    getProvocations,
} from './logic';



export const metadata: Metadata = {
    title: 'provocations',
};


export default async function Provocation() {
    const provocations = getProvocations();

    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="provocations"
            />

            <div
                className="p-6 w-full max-w-lg"
            >
                {provocations.map((provocation) => {
                    const {
                        id,
                        path,
                        person,
                        title,
                        date,
                    } = provocation;

                    return (
                        <Link
                            key={id}
                            href={`/provocations/${path}`}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white"
                        >
                            <SubtitleDateable
                                text={person}
                                date={date}
                            />

                            <div
                                className="text-sm p-2 pt-1"
                            >
                                {title}
                            </div>
                        </Link>
                    );
                })}
            </div>


            {/* <div>
                concerns list
            </div> */}
        </div>
    );
}
