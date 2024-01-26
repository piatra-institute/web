import type { Metadata } from 'next';
import Link from 'next/link';



export const metadata: Metadata = {
    title: 'tools',
};


const tools = [
    {
        name: 'sonocracy',
        description: 'platform to vote for volume control in venues, bid for songs',
        link: 'https://github.com/piatra-institute/sonocracy',
    },
    {
        name: 'xfactura-ro',
        description: 'platform for einvoicing following the Romanian/EU legislation',
        link: 'https://github.com/piatra-institute/xfactura-ro',
    },
];


export default function Tools() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full select-none"
        >
            <h1
                className="text-2xl font-bold mb-10"
            >
                tools
            </h1>

            <div>
                {tools.map((tool) => {
                    const {
                        name,
                        description,
                        link,
                    } = tool;

                    return (
                        <div
                            key={Math.random() + ''}
                            className="mb-8"
                        >
                            <h2
                                className="mb-2"
                            >
                                <Link
                                    href={link}
                                    target="_blank"
                                    className="underline"
                                >
                                    {name}
                                </Link>
                            </h2>

                            <div>
                                {description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
