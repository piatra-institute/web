'use client';

import {
    useState,
    useEffect,
    useCallback,
} from 'react';

import {
    Concern as IConcern,
    Completion,
} from '@/data';

import './styles.css';



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
    ] = useState<Completion[]>([
        {
            id: 'initial',
            concernID: '',
            createdAt: '',
            completion: context,
        },
    ]);

    const [
        completionsIndex,
        setCompletionsIndex,
    ] = useState(0);


    const viewInitialContext = () => {
        setContextValue(context || '');
        setInitialContext(true);
        setLoadingContext(false);
        setCompletionsIndex(0);
    }

    const getCompletions = useCallback(async () => {
        try {
            const request = await fetch('/api/get_regenerated_provocation_context', {
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

            const newCompletions = response.data;
            setCompletions((prevValues) => [
                ...prevValues,
                ...newCompletions,
            ]);
        } catch (error) {
            console.error(error);
        }
    }, [
        data,
    ]);

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
            const request = await fetch('/api/regenerate_provocation_context', {
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

            await getCompletions();
        } catch (error) {
            showError();
        }
    }


    useEffect(() => {
        if (!expand) {
            return;
        }

        getCompletions();
    }, [
        getCompletions,
        expand,
    ]);


    return (
        <div
            className={`flex flex-col ${expand ? 'mb-8' : 'mb-6'} p-2`}
        >
            <div
                className="select-none flex gap-1 items-center mb-2"
            >
                <button
                    className="text-2xl min-w-[35px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-white"
                    onClick={() => setExpand(!expand)}
                >
                    {expand ? '-' : '+'}
                </button>

                <div
                    className="cursor-pointer -ml-1"
                    onClick={() => setExpand(!expand)}
                >
                    <div
                        className="ml-2"
                    >
                        {text}
                    </div>
                </div>
            </div>

            {references
            && references.length > 0
            && expand
            && (
                <div
                    className="mt-4 mb-2 px-3 concern-reference"
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
                                focus:outline-none focus:ring-1 focus:ring-white
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
                                focus:outline-none focus:ring-1 focus:ring-white
                            `}
                            onClick={() => regenerateContext()}
                        >
                            regenerate
                        </button>

                        {completions.length > 1 && (
                            <div
                                className="flex gap-4 border-b-2 border-transparent font-mono max-h-[22px]"
                            >
                                <button
                                    className={`${completionsIndex === 0 ? 'cursor-default' : 'cursor-pointer'} select-none -mt-1`}
                                    onClick={() => {
                                        if (completionsIndex === 0) {
                                            return;
                                        }

                                        const newIndex = completionsIndex - 1;

                                        setCompletionsIndex(newIndex);
                                        setContextValue(
                                            completions[newIndex].completion,
                                        );

                                        if (newIndex === 0) {
                                            setInitialContext(true);
                                        } else {
                                            setInitialContext(false);
                                        }
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

                                        const newIndex = completionsIndex + 1;

                                        setCompletionsIndex(newIndex);
                                        setContextValue(
                                            completions[newIndex].completion,
                                        );

                                        if (newIndex === 0) {
                                            setInitialContext(true);
                                        } else {
                                            setInitialContext(false);
                                        }
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
