import type { Metadata } from 'next';

import Link from 'next/link';

import {
    getInterviews,
    renderDate,
} from './logic';



export const metadata: Metadata = {
    title: 'interviews',
};


export default async function Interviews() {
    const interviews = getInterviews();

    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full select-none"
        >
            <h1
                className="text-2xl font-bold mb-10"
            >
                interviews
            </h1>

            <div>
                {interviews.map((interview) => {
                    const {
                        id,
                        person,
                        title,
                        date,
                    } = interview;

                    return (
                        <div
                            key={id}
                            className="mb-8"
                        >
                            <Link
                                href={`/interviews/${id}`}
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
        </div>
    );
}
