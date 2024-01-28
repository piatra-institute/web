import type { Metadata } from 'next';

import Link from 'next/link';

import {
    getDiscussions,
    renderDate,
} from './logic';



export const metadata: Metadata = {
    title: 'discussions',
};


export default async function Discussion() {
    const discussions = getDiscussions();

    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full select-none"
        >
            <h1
                className="text-2xl font-bold mb-10"
            >
                discussions
            </h1>

            <div
                className="p-6"
            >
                {discussions.map((discussion) => {
                    const {
                        id,
                        person,
                        title,
                        date,
                    } = discussion;

                    return (
                        <div
                            key={id}
                            className="mb-8"
                        >
                            <Link
                                href={`/discussions/${id}`}
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
