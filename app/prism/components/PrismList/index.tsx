'use client';

import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';
import { linkAnchorStyle } from '@/data/styles';

import {
    prism,
} from '../../data';



export default function PrismList() {
    return (
        <IndexLayout
            title="prism"
            description="video-game productions and narrative works"
        >
            <div className="p-6 w-full max-w-lg">
                {prism.map((item) => {
                    const { name, description, link } = item;

                    return (
                        <Link
                            key={name + link}
                            href={link}
                            target="_blank"
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
