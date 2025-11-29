import { Metadata } from 'next';
import Playground from './playground';

export const metadata: Metadata = {
    title: 'placebo-nocebo dynamics · playgrounds',
    description: 'precision-weighted prediction model of placebo analgesia and nocebo hyperalgesia',
};

export default function Page() {
    return <Playground />;
}
