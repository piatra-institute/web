import type { Metadata } from 'next';

import './globals.css';

import fonts from '@/data/fonts';



export const metadata: Metadata = {
    title: {
        absolute: 'piatra.institute',
        template: '%s · piatra.institute',
    },
    description: 'love · care · deep research',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
        >
            <body
                className={`${fonts}`}
            >
                {children}
            </body>
        </html>
    );
}
