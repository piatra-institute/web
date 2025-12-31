import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'do-calculus | Piatra Institute',
    description: 'Judea Pearl\'s interventional framework for causal inference on spiking neuron models. Compare do-calculus effects with Transfer Entropy and Granger causality.',
};

export default function Page() {
    return <ClientPlayground />;
}
