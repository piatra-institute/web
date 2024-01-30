import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';

import {
    getProvocations,
    renderDate,
} from './logic';



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
                className="text-2xl font-bold mb-10"
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
                        <div
                            key={id}
                            className="mb-8"
                        >
                            <Link
                                href={`/provocations/${path}`}
                            >
                                <div
                                    className="mb-2 underline"
                                >
                                    {renderDate(date)} · {person}
                                </div>

                                <div
                                    className="text-sm"
                                >
                                    {title}
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>


            {/* <div>
                concerns list
            </div> */}
        </div>
    );
}
