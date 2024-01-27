'use client';

import {
    useState,
} from 'react';

import {
    Concern as IConcern,
} from '@/data';



export default function Concern({
    data,
}: {
    data: IConcern,
}) {
    const {
        text,
        references,
        context,
    } = data;


    const [
        showContext,
        setShowContext,
    ] = useState(false);


    return (
        <div
            className="flex flex-col mb-6"
        >
            <div
                className="select-none flex gap-1 items-center"
            >
                <span
                    className="text-2xl min-w-[35px] cursor-pointer"
                    onClick={() => setShowContext(!showContext)}
                >
                    {showContext ? '-' : '+'}
                </span>

                <span
                    className="cursor-pointer -ml-2"
                    onClick={() => setShowContext(!showContext)}
                >
                    {text}
                </span>
            </div>

            {references
            && references.length > 0
            && showContext
            && (
                <div
                    className="mt-2 mb-4"
                >
                    <div
                        className="text-xs uppercase"
                    >
                        references
                    </div>

                    {references.map(reference => {
                        if (reference.startsWith('https')) {
                            return (
                                <div
                                    key={Math.random() + ''}
                                    className="mt-2"
                                >
                                    <a
                                        href={reference}
                                        className="underline"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {reference.replace('https://', '')}
                                    </a>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={Math.random() + ''}
                                className="mt-2"
                            >
                                {reference}
                            </div>
                        );
                    })}
                </div>
            )}

            {context
            && showContext
            && (
                <div
                    className="mt-2"
                >
                    <div
                        className="text-xs uppercase"
                    >
                        context
                    </div>

                    {context}
                </div>
            )}
        </div>
    );
}
