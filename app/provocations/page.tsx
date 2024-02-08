import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';

import {
    getProvocations,
} from './logic';

import {
    renderDate,
} from '@/logic/utilities';



export const metadata: Metadata = {
    title: 'provocations',
};


export default async function Provocation() {
    const provocations = getProvocations();

    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full select-none"
        >
            <Header />

            <h1
                className="text-md uppercase font-bold mb-10"
            >
                provocations
            </h1>

            <div
                className="p-6"
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
                            <div
                                className="text-sm uppercase underline underline-offset-4 p-2 pb-0 mb-1.5"
                            >
                                {renderDate(date)} · {person}
                            </div>

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
