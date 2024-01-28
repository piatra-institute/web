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

    const regenerateContext = async () => {
        if (loadingContext) {
            return;
        }

        setInitialContext(false);
        setLoadingContext(true);

        const showError = () => {
            setContextValue('could not regenerate context');

            setTimeout(() => {
                viewInitialContext();
            }, 2_500);
        }

        try {
            const request = await fetch('/api/regenerate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    concern: data,
                }),
            });
            const response = await request.json();
            if (!response || !response.status) {
                showError();
                return;
            }

            const context = JSON.parse(response.data).context;
            setContextValue(context);
            setLoadingContext(false);
        } catch (error) {
            showError();
        }
    }


    return (
        <div
            className={`flex flex-col ${expand ? 'mb-8' : 'mb-6'} p-2`}
        >
            <div
                className="select-none flex gap-1 items-center mb-2"
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
                    className="mt-4 mb-2 px-3"
                >
                    <div
                        className="text-xs uppercase mb-2 border-b-2 border-transparent"
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
                                            className="underline break-all"
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
                    className="mt-2 px-3"
                >
                    <div
                        className="flex gap-4 items-center mb-2"
                    >
                        <div
                            className="text-xs uppercase border-b-2 border-transparent"
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
