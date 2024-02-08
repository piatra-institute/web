import type { Metadata } from 'next';

import Header from '@/components/Header';
import Title from '@/components/Title';
import SubtitleLinkable from '@/components/SubtitleLinkable';



export const metadata: Metadata = {
    title: 'platforms',
};


const platforms = [
    {
        name: 'ordershop.io',
        description: 'platform to request and manage manufacturing orders',
        link: 'https://github.com/piatra-institute/ordershop',
    },
    {
        name: 'sonocracy.com',
        description: 'platform to vote for volume control in venues, bid for songs',
        link: 'https://github.com/piatra-institute/sonocracy',
    },
    {
        name: 'xfactura.ro',
        description: 'platform for einvoicing following the Romanian/EU legislation',
        link: 'https://github.com/piatra-institute/xfactura-ro',
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
                className="p-6"
            >
                {platforms.map((platform) => {
                    const {
                        name,
                        description,
                        link,
                    } = platform;

                    return (
                        <div
                            key={name + link}
                            className="mb-8"
                        >
                            <SubtitleLinkable
                                text={name}
                                link={link}
                            />

                            <div
                                className="p-1"
                            >
                                {description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
