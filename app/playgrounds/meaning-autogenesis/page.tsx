import { Metadata } from 'next';
import dynamic from 'next/dynamic';



const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export const metadata: Metadata = {
    title: 'meaning autogenesis · playgrounds',
    description: 'Interactive exploration of how molecules become signs, based on Terrence Deacon\'s biosemiotic theory',
};

export default function MeaningAutogenesisPage() {
    return <Playground />;
}
