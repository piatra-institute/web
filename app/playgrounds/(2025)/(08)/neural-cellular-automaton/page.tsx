import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import NeuralCellularAutomatonPlayground from './playground';



export const metadata: Metadata = {
    title: 'neural-cellular-automaton · playgrounds',
    description: 'neural networks evolved through cellular automaton rules',

    openGraph: {
        ...defaultOpenGraph,
        title: 'neural-cellular-automaton · playgrounds · piatra.institute',
        description: 'neural networks evolved through cellular automaton rules',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/neural-cellular-automaton.png',
            },
        ],
    },
};

export default function NeuralCellularAutomaton() {
    return (
        <NeuralCellularAutomatonPlayground />
    );
}