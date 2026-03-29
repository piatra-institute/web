import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PapersList from './components/PapersList';

import {
    getPapers,
} from './logic';



export const metadata: Metadata = {
    title: 'papers',
    description: 'research papers and publications',

    openGraph: {
        ...defaultOpenGraph,
        title: 'papers · piatra.institute',
        description: 'research papers and publications',
    },
};


const ownPapers = [
    {
        title: 'On Faultization: Pigeonhole Principle. Morphogenetic Competencies Under Irreducible Constraint',
        date: 'March 2026',
        abstract: 'We apply the morphogenetic perturbation methodology to the pigeonhole principle, a classical impossibility theorem reinterpreted as a distributed multi-agent system. We find that local policies converge to the theoretical minimum overload in six of eight experiments, that misleading holes are far more damaging than frozen holes, and that no delayed gratification is observed in any condition.',
        pdf: '/papers/on-faultization-pigeonhole.pdf',
        github: 'https://github.com/piatra-institute/on-faultization-pigeonhole',
    },
    {
        title: 'On Faultization: Generative Pre-Trained Transformer. Morphogenetic Competencies of a Minimal Transformer',
        date: 'March 2026',
        abstract: 'We apply morphogenetic perturbation methodology to a minimal transformer (4-layer, 16-dimensional, 4-head character-level GPT) through twelve experiments spanning perturbation-during-training and multi-phase morphogenetic interventions. We identify four emergent behaviors not directly prescribed by SGD (stress inoculation, complete recovery, complete regeneration, and head-freezing trajectory improvement), three that reflect basin geometry, and three that demonstrate tolerance.',
        pdf: '/papers/on-faultization-gpt.pdf',
        github: 'https://github.com/piatra-institute/on-faultization-gpt',
    },
];


export default function Papers() {
    const papers = getPapers();

    return (
        <PapersList
            papers={papers}
            ownPapers={ownPapers}
        />
    );
}
