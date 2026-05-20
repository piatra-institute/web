'use client';

import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';
import { linkAnchorStyle } from '@/data/styles';

import {
    courses,
} from '../../data';



export default function PaideiaList() {
    return (
        <IndexLayout
            title="paideia"
            description="patient public literacy"
        >
            <div className="p-6 w-full max-w-lg">
                {courses.map((course) => {
                    const { name, description, audience, link, slug } = course;

                    return (
                        <Link
                            key={slug}
                            href={link}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white"
                            draggable={false}
                        >
                            <div className={linkAnchorStyle}>
                                {name}
                            </div>

                            <div className="text-sm p-2 pt-0">
                                {description}
                            </div>

                            <div className="text-sm p-2 pt-0">
                                {audience}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </IndexLayout>
    );
}
