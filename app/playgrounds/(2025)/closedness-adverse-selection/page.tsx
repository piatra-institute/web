import { Metadata } from 'next';
import Playground from './playground';

export const metadata: Metadata = {
    title: 'closedness adverse selection · playgrounds',
    description: 'how no-criticism constraints filter entrants toward lower moral aversion',
};

export default function Page() {
    return <Playground />;
}
