'use client';

import {
    useState,
    useEffect,
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

    const [
        completions,
        setCompletions,
    ] = useState<any[]>([]);

    const [
        completionsIndex,
        setCompletionsIndex,
    ] = useState(-1);


    const viewInitialContext = () => {
        setContextValue(context || '');
        setInitialContext(true);
        setLoadingContext(false);
        setCompletionsIndex(-1);
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
            const request = await fetch('/api/regenerate_discussion_context', {
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


    useEffect(() => {
        if (!expand) {
            return;
        }

        const getCompletions = async () => {
            try {
                const request = await fetch('/api/get_regenerated_discussion_context', {
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
                    return;
                }

                const completions = response.data;
                setCompletions(completions);
            } catch (error) {
                console.error(error);
            }
        }

        getCompletions();
    }, [
        expand,
        data,
    ]);


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

                        {completions.length > 0 && (
                            <div
                                className="flex gap-4 border-b-2 border-transparent font-mono max-h-[22px]"
                            >
                                <button
                                    className={`${completionsIndex > 0 ? 'cursor-pointer' : 'cursor-default'} select-none -mt-1`}
                                    onClick={() => {
                                        if (completionsIndex <= 0) {
                                            return;
                                        }

                                        setCompletionsIndex(completionsIndex - 1);
                                        setContextValue(
                                            completions[completionsIndex - 1].completion,
                                        );
                                        setInitialContext(false);
                                    }}
                                >
                                    {completionsIndex > 0 ? '◀' : '◁'}
                                </button>

                                <button
                                    className={`${completionsIndex < completions.length - 1 ? 'cursor-pointer' : 'cursor-default'} select-none -mt-1`}
                                    onClick={() => {
                                        if (completionsIndex === completions.length - 1) {
                                            return;
                                        }

                                        setCompletionsIndex(completionsIndex + 1);
                                        setContextValue(
                                            completions[completionsIndex + 1].completion,
                                        );
                                        setInitialContext(false);
                                    }}
                                >
                                    {completionsIndex < completions.length - 1 ? '▶' : '▷'}
                                </button>
                            </div>
                        )}
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
