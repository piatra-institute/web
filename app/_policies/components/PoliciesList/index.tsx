'use client';

import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';
import IndexFilters from '@/components/IndexFilters';
import { linkAnchorStyle } from '@/data/styles';
import { parseIndexDate, formatIndexDate } from '@/lib/parseIndexDate';

import {
    policies,
    Policy,
} from '../../data';



function getDate(p: Policy): string | null {
    return p.date ?? null;
}

function getSearchableText(p: Policy): string {
    return [p.name, p.title, p.subtitle, p.description].filter(Boolean).join(' ');
}


export default function PoliciesList() {
    return (
        <IndexLayout
            title="policies"
            description="roadmaps and position documents addressed to institutional audiences"
        >
            <IndexFilters
                items={policies}
                getDate={getDate}
                getSearchableText={getSearchableText}
                storageKey="policies-filter"
                dataLabel="policy"
            >
                {(filtered) => (
                    <div className="p-6 w-full max-w-lg">
                        {filtered.length === 0 ? (
                            <div className="text-center text-sm text-gray-500">
                                no policies match these filters
                            </div>
                        ) : (
                            filtered.map((policy) => {
                                const { path, name, description, date } = policy;
                                const displayDate = formatIndexDate(parseIndexDate(date));

                                return (
                                    <Link
                                        key={path}
                                        href={`/policies/${path}`}
                                        className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white"
                                        draggable={false}
                                    >
                                        {displayDate && (
                                            <div className="text-white text-sm mb-1 text-center">
                                                {displayDate}
                                            </div>
                                        )}

                                        <div className={linkAnchorStyle}>
                                            {name}
                                        </div>

                                        <div className="text-sm p-2 pt-0">
                                            {description}
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}
            </IndexFilters>
        </IndexLayout>
    );
}
