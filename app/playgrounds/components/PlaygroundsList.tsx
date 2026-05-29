'use client';

import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';
import IndexFilters from '@/components/IndexFilters';
import { linkAnchorStyle } from '@/data/styles';
import { TOPICS, OPERATIONS } from '@/data/classification';

import { playgrounds } from '../data';


type Playground = (typeof playgrounds)[number];


function getDate(p: Playground): string | null {
    return p.date ?? null;
}

function getSearchableText(p: Playground): string {
    return `${p.name} ${p.description}`;
}


export default function PlaygroundsList() {
    return (
        <IndexLayout
            title="playgrounds"
            description={
                <>
                    the playgrounds are in various stages of development
                    <br />
                    from conceptual sketches to fully functional applications
                </>
            }
        >
            <IndexFilters
                items={playgrounds}
                getDate={getDate}
                getSearchableText={getSearchableText}
                storageKey="playgrounds-filter"
                dataLabel="playground"
                chipGroups={[
                    {
                        key: 'topics',
                        label: 'topic',
                        options: TOPICS,
                        getItemKeys: (p) => p.topics,
                    },
                    {
                        key: 'operations',
                        label: 'operation',
                        options: OPERATIONS,
                        getItemKeys: (p) => p.operations,
                    },
                ]}
            >
                {(filtered) => (
                    <div className="p-6 w-full">
                        {filtered.length === 0 ? (
                            <div className="text-center text-sm text-gray-500">
                                no playgrounds match these filters
                            </div>
                        ) : (
                            filtered.map((p) => (
                                <Link
                                    key={p.name + p.link}
                                    href={p.link}
                                    className="mb-8 block focus:outline-none focus-visible:outline-1 focus-visible:outline-lime-500 text-center"
                                    draggable={false}
                                >
                                    <div className={linkAnchorStyle}>
                                        {p.name} · {p.date}
                                    </div>

                                    {p.description && <div>{p.description}</div>}
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </IndexFilters>
        </IndexLayout>
    );
}
