import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2026',
        description:
            'builds the Ramsey-theory sandbox: an edge-colored complete graph K_n with circle, tower, spiral, and random layouts; four coloring strategies including a greedy adversarial one; exact monochromatic-clique enumeration; the cost-of-chaos metric as the fraction of edges trapped in forced cliques; the small-case Ramsey threshold; and an honest calibration showing the greedy adversary is suboptimal below threshold.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2026',
        changes: [
            'graph model: a complete graph K_n with n adjustable, edges 2-colored by a chosen strategy (distance, modular, random, or greedy adversarial).',
            'exact monochromatic-clique detection by brute-force enumeration over all size-k subsets.',
            'cost-of-chaos metric: the count and edge-fraction of relations trapped inside forced monochromatic cliques.',
            'Ramsey threshold lookup for the symmetric 2-color case R(s,s); structure flagged as forced once n reaches the threshold.',
            'draggable layouts (circle, tower, spiral, random) with bent, layered edges for legibility.',
            'calibration: six exact combinatorial checks (small Ramsey numbers, edge counts, single-color triangle counts, the forced-threshold theorem) plus one honest case proving the greedy adversary is not optimal below threshold.',
        ],
    },
];
