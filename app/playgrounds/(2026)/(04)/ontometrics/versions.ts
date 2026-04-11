import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'April 2026',
        description: 'Initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            'Ontology editor with categories, relations, axioms (disjoint/subtype/dependsOn/identity), and case assignments',
            '4 domain presets: metaphysics, mind/consciousness, rights/law, particle physics',
            'MDL-inspired quality function: Q = Fit \u2212 \u03BB\u00B7Complexity \u2212 \u03BC\u00B7Redundancy \u2212 \u03BD\u00B7Inconsistency \u2212 \u03C1\u00B7Brittleness',
            '5-phase classification: Underdeveloped, Calibrated, Heavy but workable, Overdetermined, Brittle confusion',
            'Harman undermining/overmining index from axiom type distribution',
            'MDL decomposition: description length vs residual surprise',
            'Phase map SVG with fit vs structure-load quadrants',
        ],
    },
];
