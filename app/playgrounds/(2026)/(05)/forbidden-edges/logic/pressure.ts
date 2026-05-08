import type { Metrics } from './metrics';
import type { Pressures } from './index';

/**
 * Modulate a base action delta by current pressure parameters. Each pressure
 * tunes one or more metric channels:
 *
 *   empathy     ↓ |harm|, ↑ repair (others' pain enters valuation)
 *   dopamine    ↑ |trust|, ↑ |domination| (local-reward bias amplifies actions)
 *   institutional ↑ repair, ↑ agency (rule of law buffers shocks)
 *   scarcity    ↑ |harm|, ↑ |ecology| (zero-sum amplifies collisions)
 *   memory      ↑ |trust|, ↑ repair (hysteresis: past actions persist)
 *   ecology     ↑ |ecology| (ecological coupling magnifies environmental deltas)
 */
export function applyPressureModulation(
    baseDelta: Partial<Metrics>,
    p: Pressures,
): Partial<Metrics> {
    const out: Partial<Metrics> = { ...baseDelta };

    // Empathy reduces harm impact magnitude (whether harm goes up or down)
    if (out.harm !== undefined) out.harm *= (1 - 0.45 * p.empathy);
    if (out.repair !== undefined) out.repair *= (1 + 0.4 * p.empathy);

    // Dopamine bias amplifies trust and domination changes
    if (out.trust !== undefined) out.trust *= (1 + 0.3 * (p.dopamine - 0.5));
    if (out.domination !== undefined) out.domination *= (1 + 0.5 * p.dopamine);

    // Institutional strength boosts repair and agency
    if (out.repair !== undefined) out.repair *= (1 + 0.5 * p.institutional);
    if (out.agency !== undefined) out.agency *= (1 + 0.3 * p.institutional);

    // Scarcity amplifies harm magnitude and ecological pressure
    if (out.harm !== undefined) out.harm *= (1 + 0.5 * p.scarcity);
    if (out.ecology !== undefined) out.ecology *= (1 + 0.4 * p.scarcity);

    // Memory boosts trust and repair (hysteresis)
    if (out.trust !== undefined) out.trust *= (1 + 0.25 * p.memory);
    if (out.repair !== undefined) out.repair *= (1 + 0.3 * p.memory);

    // Ecology coupling amplifies ecology changes
    if (out.ecology !== undefined) out.ecology *= (1 + 0.6 * p.ecology);

    return out;
}
