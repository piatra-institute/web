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
        expand,
        setExpand,
    ] = useState(false);

    const [
        loadingContext,
        setLoadingContext,
    ] = useState(false);

    const [
        initialContext,
        setInitialContext,
    ] = useState(true);

    const [
        contextValue,
        setContextValue,
    ] = useState(context || '');


    const viewInitialContext = () => {
        setContextValue(context || '');
        setInitialContext(true);
        setLoadingContext(false);
    }

    const regenerateContext = () => {
        if (loadingContext) {
            return;
        }

        setInitialContext(false);
        setLoadingContext(true);

        // TODO
        // request regeneration
        // setContextValue(response);

        setTimeout(() => {
            setLoadingContext(false);
        }, 3_000);
    }


    return (
        <div
            className={`flex flex-col ${expand ? 'mb-8' : 'mb-6'}`}
        >
            <div
                className="select-none flex gap-1 items-center"
            >
                <button
                    className="text-2xl min-w-[35px] cursor-pointer"
                    onClick={() => setExpand(!expand)}
                >
                    {expand ? '-' : '+'}
                </button>

                <span
                    className="cursor-pointer -ml-1"
                    onClick={() => setExpand(!expand)}
                >
                    {text}
                </span>
            </div>

            {references
            && references.length > 0
            && expand
            && (
                <div
                    className="mt-4 mb-2"
                >
                    <div
                        className="text-xs uppercase mb-2"
                    >
                        references
                    </div>

                    <ul
                        className="list-disc pl-4"
                    >
                        {references.map(reference => {
                            if (reference.startsWith('https')) {
                                return (
                                    <li
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
                                    </li>
                                );
                            }

                            return (
                                <li
                                    key={Math.random() + ''}
                                    className="mt-2 text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: reference }}
                                />
                            );
                        })}
                    </ul>
                </div>
            )}

            {contextValue
            && expand
            && (
                <div
                    className="mt-2"
                >
                    <div
                        className="flex gap-4 items-center mb-2"
                    >
                        <div
                            className="text-xs uppercase"
                        >
                            context
                        </div>

                        <button
                            className={`
                                text-xs uppercase font-bold cursor-pointer select-none px-1 py-0.5
                                border-b-2 ${initialContext && !loadingContext ? 'border-white' : 'border-gray-600'}
                            `}
                            onClick={() => viewInitialContext()}
                        >
                            initial
                        </button>

                        <button
                            className={`
                                text-xs uppercase font-bold select-none px-1 py-0.5
                                border-b-2 ${initialContext ? 'border-gray-600' : 'border-white'}
                                ${loadingContext ? 'animate-pulse cursor-wait border-white' : 'cursor-pointer'}
                            `}
                            onClick={() => regenerateContext()}
                        >
                            regenerate
                        </button>
                    </div>

                    <div
                        className="leading-releaxed"
                        dangerouslySetInnerHTML={{ __html: contextValue }}
                    />
                </div>
            )}
        </div>
    );
}
