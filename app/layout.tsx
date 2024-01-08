import type { Metadata } from 'next';
import { Inter, Libre_Baskerville } from 'next/font/google';
import './globals.css';



const inter = Inter({ subsets: ['latin'] })
const libreBaskerville = Libre_Baskerville({
    weight: ['400', '700'],
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'piatra.institute',
    description: 'love · care · deep research',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} ${libreBaskerville.className}`}
            >
                {children}
            </body>
        </html>
    );
}
