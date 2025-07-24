import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import {
    linkAnchorStyle,
} from '@/data/styles';



export const metadata: Metadata = {
    title: 'platforms',
};


const platforms = [
    // {
    //     name: 'gptmetry . com',
    //     description: 'CAD compiler across vendors, from technical drawings and sketches into CAD/CAM/G-code',
    //     link: 'https://gptmetry.com',
    // },
    // {
    //     name: 'nodetry . com',
    //     description: 'poetry node editor',
    //     link: 'https://nodetry.com',
    // },
    // {
    //     name: 'ordershop . io',
    //     description: 'request and manage manufacturing orders',
    //     link: 'https://ordershop.io',
    // },
    // {
    //     name: 'outmill . run',
    //     description: 'run on outdoor treadmills',
    //     link: 'https://outmill.run',
    // },
    // {
    //     name: 'returber . com',
    //     description: 'waste collection for the deposit return system',
    //     link: 'https://returber.com',
    // },
    // {
    //     name: 'sonocracy . com',
    //     description: 'vote for volume control and bid for songs in venues',
    //     link: 'https://sonocracy.com',
    // },
    {
        name: 'catala . ro',
        description: 'Romanian implementation of the Catala language for programmatic law',
        link: 'https://catala.ro',
    },
    {
        name: 'xfactura . ro',
        description: 'einvoicing and general accounting following the Romanian/EU legislation',
        link: 'https://xfactura.ro',
    },
];


export default function Platforms() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="platforms"
            />

            <div
                className="p-6 w-full max-w-lg"
            >
                {platforms.map((platform) => {
                    const {
                        name,
                        description,
                        link,
                    } = platform;

                    return (
                        <Link
                            key={name + link}
                            href={link}
                            target="_blank"
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white"
                            draggable={false}
                        >
                            <div
                                className={linkAnchorStyle}
                            >
                                {name}
                            </div>

                            <div
                                className="text-sm p-2 pt-0"
                            >
                                {description}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
