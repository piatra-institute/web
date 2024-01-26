'use client';

import {
    useState,
} from 'react';

import {
    Question as IQuestion,
} from '@/app/interviews/data';



export default function Question({
    data,
}: {
    data: IQuestion,
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
                onClick={() => setShowContext(!showContext)}
                className="cursor-pointer"
            >
                {showContext ? '-' : '+'} {text}
            </div>

            {references.map((reference: any) => {
                return (
                    <div
                        key={Math.random() + ''}
                        className="mt-2"
                    >
                        {reference}
                    </div>
                );
            })}

            {context && showContext && (
                <div
                    className="mt-2"
                >
                    context: {context}
                </div>
            )}
        </div>
    );
}
