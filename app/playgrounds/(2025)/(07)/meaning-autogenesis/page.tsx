import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'meaning autogenesis · playgrounds',
    description: 'Interactive exploration of how molecules become signs, based on Terrence Deacon\'s biosemiotic theory',
};

export default function MeaningAutogenesisPage() {
    return <ClientPlayground />;
}
