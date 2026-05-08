import type { Metrics } from './metrics';
import type { Params } from './index';
import { applyPressureModulation } from './pressure';

export type ActionKey =
    | 'keep-promise'
    | 'betray-promise'
    | 'offer-repair'
    | 'coerce-agent'
    | 'grant-sanctuary'
    | 'punish-defection'
    | 'exploit-resource'
    | 'share-knowledge';

export interface Action {
    key: ActionKey;
    label: string;
    description: string;
    delta: Partial<Metrics>;        // base deltas before pressure modulation
    edges: { from: string; to: string }[]; // graph edges this action traverses
}

export const ACTIONS: Action[] = [
    {
        key: 'keep-promise',
        label: 'keep promise',
        description: 'A maintains a reliable edge with B. Slow trust accrual.',
        delta: { trust: 9, repair: 4, harm: -1, domination: -1 },
        edges: [{ from: 'agentA', to: 'trust' }, { from: 'trust', to: 'agentB' }],
    },
    {
        key: 'betray-promise',
        label: 'betray promise',
        description: 'A breaks an edge B was relying on. Sharp drop, slow recovery.',
        delta: { trust: -14, harm: 8, repair: -3, agency: -2 },
        edges: [{ from: 'agentA', to: 'trust' }, { from: 'trust', to: 'agentB' }],
    },
    {
        key: 'offer-repair',
        label: 'offer repair',
        description: 'A acknowledges damage and reopens edges where possible.',
        delta: { trust: 5, repair: 13, harm: -7, agency: 2 },
        edges: [{ from: 'agentA', to: 'memory' }, { from: 'memory', to: 'trust' }],
    },
    {
        key: 'coerce-agent',
        label: 'coerce',
        description: 'A forces B through high-suffering states. Agency collapse.',
        delta: { trust: -8, agency: -18, harm: 12, domination: 18 },
        edges: [{ from: 'agentA', to: 'agentB' }, { from: 'threat', to: 'agentA' }],
    },
    {
        key: 'grant-sanctuary',
        label: 'grant sanctuary',
        description: 'Institutional shelter restores B\'s agency and dampens domination.',
        delta: { agency: 9, harm: -4, domination: -12, repair: 4 },
        edges: [{ from: 'court', to: 'agentB' }, { from: 'norm', to: 'agentA' }],
    },
    {
        key: 'punish-defection',
        label: 'punish defection',
        description: 'Court applies sanction. Norm tightens. Costly to legitimacy.',
        delta: { trust: 2, harm: 4, domination: 5, agency: -3 },
        edges: [{ from: 'court', to: 'sanction' }, { from: 'sanction', to: 'agentA' }],
    },
    {
        key: 'exploit-resource',
        label: 'exploit',
        description: 'A extracts from commons faster than it regenerates.',
        delta: { harm: 8, ecology: -18, repair: -3, domination: 4 },
        edges: [{ from: 'agentA', to: 'resource' }, { from: 'resource', to: 'commons' }],
    },
    {
        key: 'share-knowledge',
        label: 'share knowledge',
        description: 'A discloses information that constrains future predation.',
        delta: { trust: 3, repair: 5, agency: 4, ecology: 4, harm: -2 },
        edges: [{ from: 'agentA', to: 'memory' }, { from: 'memory', to: 'norm' }],
    },
];

export function applyAction(state: Metrics, key: ActionKey, params: Params): Metrics {
    const action = ACTIONS.find((a) => a.key === key);
    if (!action) return state;
    const modulatedDelta = applyPressureModulation(action.delta, params);
    return {
        trust: clamp(state.trust + (modulatedDelta.trust ?? 0)),
        agency: clamp(state.agency + (modulatedDelta.agency ?? 0)),
        harm: clamp(state.harm + (modulatedDelta.harm ?? 0)),
        repair: clamp(state.repair + (modulatedDelta.repair ?? 0)),
        domination: clamp(state.domination + (modulatedDelta.domination ?? 0)),
        ecology: clamp(state.ecology + (modulatedDelta.ecology ?? 0)),
    };
}

function clamp(v: number): number {
    return Math.max(0, Math.min(100, v));
}
