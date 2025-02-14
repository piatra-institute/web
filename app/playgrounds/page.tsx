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
        description: 'cell-based sorting algorithms',
    },
    {
        name: 'estigrade',
        link: '/playgrounds/estigrade',
        description: 'grade estimation'
    },
    {
        name: 'coasellular morphogenesis',
        link: '/playgrounds/coasellular-morphogenesis',
        description: '',
    },
    {
        name: 'fracqunx',
        link: '/playgrounds/fracqunx',
        description: 'fractional quincunx',
    },

    // {
    //     name: 'eyevolution',
    //     link: '/playgrounds/eyevolution',
    //     description: '',
    // },
    // {
    //     name: 'pacemaker-accumulator',
    //     link: '/playgrounds/pacemaker-accumulator',
    //     description: '',
    // },
    // {
    //     name: 'cpt-variance',
    //     link: '/playgrounds/cpt-variance',
    //     description: '',
    // },
    // {
    //     name: 'refractive computation',
    //     link: '/playgrounds/refractive-computation',
    //     description: '',
    // },
    // {
    //     name: 'metamaterials',
    //     link: '/playgrounds/metamaterials',
    //     description: '',
    // },
    // {
    //     name: 'lifesong',
    //     link: '/playgrounds/lifesong',
    //     description: '',
    // },
    // {
    //     name: 'vote no',
    //     link: '/playgrounds/vote-no',
    //     description: '',
    // },
    // {
    //     name: 'everything... relevant',
    //     link: '/playgrounds/everything-relevant',
    //     description: '',
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
                        description,
                    } = playground;

                    return (
                        <Link
                            key={name + link}
                            href={link}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center"
                            draggable={false}
                        >
                            <div
                                className={linkAnchorStyle}
                            >
                                {name}
                            </div>

                            {description && (
                                <div>
                                    {description}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
