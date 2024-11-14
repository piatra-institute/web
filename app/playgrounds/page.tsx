import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import {
    linkAnchorStyle,
} from '@/data/styles';



export const metadata: Metadata = {
    title: 'playgrounds',
};


const playgrounds = [
    {
        name: 'self-sorted arrays',
        link: '/playgrounds/self-sorted-arrays',
    },
    {
        name: 'estigrade',
        link: '/playgrounds/estigrade',
    },
    {
        name: 'coasellular morphogenesis',
        link: '/playgrounds/coasellular-morphogenesis',
    },
    // {
    //     name: 'refractive computation',
    //     link: '/playgrounds/refractive-computation',
    // },
    // {
    //     name: 'metamaterials',
    //     link: '/playgrounds/metamaterials',
    // },
    // {
    //     name: 'lifesong',
    //     link: '/playgrounds/lifesong',
    // },
    // {
    //     name: 'vote no',
    //     link: '/playgrounds/vote-no',
    // },
    // {
    //     name: 'everything... relevant',
    //     link: '/playgrounds/everything-relevant',
    // },
];


export default function Playgrounds() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="playgrounds"
            />

            <div
                className="p-6"
            >
                {playgrounds.map((playground) => {
                    const {
                        name,
                        link,
                    } = playground;

                    return (
                        <Link
                            key={name + link}
                            href={link}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center"
                        >
                            <div
                                className={linkAnchorStyle}
                            >
                                {name}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
