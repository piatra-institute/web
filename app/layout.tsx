import type { Viewport } from 'next';
import type { Metadata } from 'next';

import fonts from '@/data/fonts';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import './globals.css';



export const metadata: Metadata = {
    title: {
        absolute: 'piatra.institute',
        template: '%s · piatra.institute',
    },
    description: 'love · care · deep research',
    creator: 'piatra.institute',
    publisher: 'piatra.institute',
    robots: 'index, follow',
    referrer: 'origin',
    metadataBase: new URL('https://piatra.institute'),
    alternates: {
        canonical: 'https://piatra.institute',
    },
    icons: {
        other: [
            {
                rel: 'mask-icon',
                url: '/safari-pinned-tab.svg',
                color: '#5bbad5',
            },
        ],
    },
    openGraph: {
        ...defaultOpenGraph,
    },
};


export const viewport: Viewport = {
    themeColor: '#000000',
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <html
            lang="en"
            suppressHydrationWarning={true}
        >
            <body
                className={`${fonts}`}
            >
                {children}
            </body>
        </html>
    );
}
