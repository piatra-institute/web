'use client';

import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';
import { linkAnchorStyle } from '@/data/styles';

import {
    policies,
} from '../../data';



export default function PoliciesList() {
    return (
        <IndexLayout
            title="policies"
            description="roadmaps and position documents addressed to institutional audiences"
        >
            <div className="p-6 w-full max-w-lg">
                {policies.map((policy) => {
                    const { path, name, description } = policy;

                    return (
                        <Link
                            key={path}
                            href={`/policies/${path}`}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white"
                            draggable={false}
                        >
                            <div className={linkAnchorStyle}>
                                {name}
                            </div>

                            <div className="text-sm p-2 pt-0">
                                {description}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </IndexLayout>
    );
}
