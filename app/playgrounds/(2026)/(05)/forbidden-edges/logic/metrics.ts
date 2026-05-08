export interface Metrics {
    trust: number;       // 0..100
    agency: number;
    harm: number;
    repair: number;
    domination: number;
    ecology: number;
}

export type Regime = 'stable' | 'contested' | 'fragile';

export function computeViability(m: Metrics): number {
    return (
        0.22 * m.trust +
        0.24 * m.agency +
        0.22 * (100 - m.harm) +
        0.12 * m.repair +
        0.14 * (100 - m.domination) +
        0.06 * m.ecology
    );
}

export function regimeOf(viability: number): { regime: Regime; label: string } {
    if (viability >= 76) return { regime: 'stable', label: 'stable moral topology' };
    if (viability >= 52) return { regime: 'contested', label: 'contested but repairable' };
    return { regime: 'fragile', label: 'fragile or predatory graph' };
}
