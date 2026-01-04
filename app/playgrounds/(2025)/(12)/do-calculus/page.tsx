import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'do-calculus · playgrounds',
    description: 'Judea Pearl\'s interventional framework for causal inference on spiking neuron models. Compare do-calculus effects with Transfer Entropy and Granger causality.',

    openGraph: {
        ...defaultOpenGraph,
        title: 'do-calculus · playgrounds · piatra.institute',
        description: 'Judea Pearl\'s interventional framework for causal inference on spiking neuron models. Compare do-calculus effects with Transfer Entropy and Granger causality.',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
