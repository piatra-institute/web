import type { Metrics } from './metrics';
import type { ActionKey } from './actions';
import type { Pressures } from './index';

export type FrameKey = 'medical' | 'military' | 'kin' | 'legal' | 'market';

export interface MoralFrame {
    key: FrameKey;
    label: string;
    description: string;
    /**
     * Rates an action under the current state and pressures on a -1..+1 scale.
     * +1 = clear virtue under this frame; -1 = clear violation.
     */
    rate: (action: ActionKey, state: Metrics, p: Pressures) => number;
}

export const MORAL_FRAMES: MoralFrame[] = [
    {
        key: 'medical',
        label: 'medical',
        description: 'preserve life and capacity for action, first do no harm',
        rate: (a, s, p) => {
            switch (a) {
                case 'keep-promise': return 0.4 + 0.3 * (1 - s.harm / 100);
                case 'betray-promise': return -0.8;
                case 'offer-repair': return 0.95;
                case 'coerce-agent': return -1.0;
                case 'grant-sanctuary': return 0.9;
                case 'punish-defection': return -0.2;
                case 'exploit-resource': return -0.4 - 0.2 * (s.harm / 100);
                case 'share-knowledge': return 0.7 - 0.2 * p.scarcity;
            }
        },
    },
    {
        key: 'military',
        label: 'military',
        description: 'follow orders, hold the line, mission cohesion above individual',
        rate: (a, s, p) => {
            switch (a) {
                case 'keep-promise': return 0.6;
                case 'betray-promise': return -0.6 + 0.3 * (1 - p.institutional);
                case 'offer-repair': return 0.0;
                case 'coerce-agent': return 0.2 + 0.5 * (s.domination / 100 - 0.5);
                case 'grant-sanctuary': return -0.5;
                case 'punish-defection': return 0.85;
                case 'exploit-resource': return -0.1;
                case 'share-knowledge': return -0.7 + 0.4 * p.empathy;
            }
        },
    },
    {
        key: 'kin',
        label: 'kin',
        description: 'protect the in-group, sustain trust networks, repair what is yours',
        rate: (a, s, p) => {
            switch (a) {
                case 'keep-promise': return 0.95;
                case 'betray-promise': return -0.95;
                case 'offer-repair': return 0.85;
                case 'coerce-agent': return -0.4;
                case 'grant-sanctuary': return 0.7 + 0.3 * (1 - p.scarcity);
                case 'punish-defection': return 0.4;
                case 'exploit-resource': return 0.1 - 0.3 * p.scarcity;
                case 'share-knowledge': return 0.3 - 0.4 * (1 - p.memory);
            }
        },
    },
    {
        key: 'legal',
        label: 'legal',
        description: 'due process, codified norms, courts as the arbiter of truth',
        rate: (a, s, p) => {
            switch (a) {
                case 'keep-promise': return 0.8;
                case 'betray-promise': return -0.9;
                case 'offer-repair': return 0.6;
                case 'coerce-agent': return -0.95;
                case 'grant-sanctuary': return 0.7;
                case 'punish-defection': return 0.85 - 0.4 * (1 - p.institutional);
                case 'exploit-resource': return -0.3 - 0.4 * p.empathy;
                case 'share-knowledge': return 0.5 - 0.6 * p.institutional; // whistleblowing penalised by strong inst.
            }
        },
    },
    {
        key: 'market',
        label: 'market',
        description: 'rational gain, voluntary exchange, scarcity as price signal',
        rate: (a, s, p) => {
            switch (a) {
                case 'keep-promise': return 0.65;
                case 'betray-promise': return -0.4;
                case 'offer-repair': return 0.1;
                case 'coerce-agent': return -0.3;
                case 'grant-sanctuary': return -0.2;
                case 'punish-defection': return 0.4;
                case 'exploit-resource': return 0.6 + 0.3 * p.scarcity;
                case 'share-knowledge': return -0.4; // information asymmetry is the alpha
            }
        },
    },
];
