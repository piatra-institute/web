import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2025',
        description:
            'first cut. recreates the 1982 ultimatum game as a two-force decision: desire for the reward versus resentment at unfairness, with acceptance decided by which force is larger. adds a calibration of the deterministic core (resentment ramp, pie conservation, the decision boundary and the tipping point), six assumptions separating the established game structure from the speculative linear-threshold choice rule, and a research companion on the experiment and its successors.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2025',
        changes: [
            'decision model: accept the offer when desire is at least as large as resentment, otherwise reject.',
            'resentment as a linear ramp in unfairness, resentment = (5 - offer) times 25 capped at 100, with no resentment for fair or generous splits.',
            'fixed pie of ten coins with explicit proposer share, and a biased offer generator that leans toward unfair offers to probe the decision boundary.',
            'tipping-point detector flagging offers where desire and resentment are within five points of each other.',
            'live session statistics: acceptance rate, model accuracy against the player\'s own choices, and average offer.',
            'calibration of the deterministic core and a six-item assumption panel that marks the linear ramp and hard threshold as speculative simplifications.',
        ],
    },
];
