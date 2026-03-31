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
        title: 'On Faultization: Pigeonhole Principle. What Perturbation Reveals About Pattern Access Under Irreducible Constraint',
        date: 'March 2026',
        abstract: 'We apply faultization — systematic morphogenetic perturbation — to the pigeonhole principle, reinterpreted as a distributed multi-agent system, to probe what patterns from the latent space (Levin, 2026) the system accesses under irreducible constraint. The theoretical minimum overload O_min = m − n is a mathematical truth that the system channels without computing. In six of eight experiments, every run converges to O_min exactly (zero variance) — the strongest evidence for pattern-driven dynamics. Perceptual noise causes immediate degradation with no tolerance threshold, misleading holes invert the pattern-seeking mechanism, and all four local policies reach identical endpoints despite 5x differences in process cost.',
        pdf: '/papers/on-faultization-pigeonhole.pdf',
        github: 'https://github.com/piatra-institute/on-faultization-pigeonhole',
    },
    {
        title: 'On Faultization: Generative Pre-Trained Transformer. What Perturbation Reveals About Pattern Access in a Minimal Transformer',
        date: 'March 2026',
        abstract: 'We apply faultization — systematic morphogenetic perturbation — to a minimal transformer (4-layer, 16-dimensional, 4-head character-level GPT) to probe what patterns from the latent space (Levin, 2026) the system accesses. Twelve experiments reveal that the optimization pattern is accessible through radically different interfaces (local loss, partial communication, chimeric assembly), that absent interface components are tolerated while corrupted ones are catastrophic (+0.2% vs +24.8%), and that gradual noise exposure unlocks a stress-tolerance pattern that sudden exposure does not (p = 0.0001, d = −0.227) — a free lunch the system receives without the optimizer paying for it.',
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
