import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'closedness adverse selection · playgrounds',
    description: 'how no-criticism constraints filter entrants toward lower moral aversion',
};

export default function Page() {
    return <ClientPlayground />;
}
