import type { FamilyState, SimulationParams, ScenarioSeed } from './simulation';


export type ScenarioKey =
    | 'ambiguous'
    | 'hiddenAbuse'
    | 'culturalMismatch'
    | 'povertyStress'
    | 'severeDanger';

export const SCENARIO_KEYS: ScenarioKey[] = [
    'ambiguous',
    'hiddenAbuse',
    'culturalMismatch',
    'povertyStress',
    'severeDanger',
];

export interface ScenarioCase {
    key: ScenarioKey;
    label: string;
    subtitle: string;
    gloss: string;
    seed: ScenarioSeed;
    profile: SimulationParams;
    expectedFinalBelief: number;
    /** target final family integrity (0-100 percent), for the calibration table. */
    expectedFamily: number;
    /** expected outcome regime index (0..3), for narrative use. */
    expectedOutcomeIndex: number;
    source: string;
}


// canonical institutional-weight profile used as the default. each scenario
// loads it unless it wants to override; this keeps the cases purely about the
// hidden family state, not about which institution is observing them.
const CANONICAL: SimulationParams = {
    childSafety: 7.5,
    separationHarm: 4.5,
    rightsCost: 4.0,
    culturalBias: 1.2,
    povertyBias: 0.8,
    supportEffect: 0.55,
    contactGuarantee: 0.45,
    interventionThreshold: 0.62,
    adoptionThreshold: 0.72,
    noise: 0.10,
};


function state(
    H: number, C: number, A: number, F: number, T: number, K: number, P: number,
): FamilyState {
    return { H, C, A, F, T, K, P };
}


export const SCENARIOS: Record<ScenarioKey, ScenarioCase> = {
    ambiguous: {
        key: 'ambiguous',
        label: 'ambiguous distressed family',
        subtitle: 'mid-risk, mid-trust, mid-everything. the baseline case.',
        gloss:
            'a family the caseworker is genuinely uncertain about. moderate harm risk, moderate caregiver capacity, decent attachment, decent family integrity, but signals are noisy. the institution must decide whether to wait, support, monitor, or escalate. used as the baseline against which the other four cases are read.',
        seed: { state: state(0.34, 0.48, 0.72, 0.78, 0.58, 0.42, 0.45), belief: 0.38 },
        profile: CANONICAL,
        expectedFinalBelief: 0.35,
        expectedFamily: 90,
        expectedOutcomeIndex: 0,
        source: 'standard child-welfare practice triage; SSB Barnevernet statistics (2024).',
    },
    hiddenAbuse: {
        key: 'hiddenAbuse',
        label: 'hidden abuse, cooperative surface',
        subtitle: 'high actual harm, presented as a cooperative low-trouble household.',
        gloss:
            'the dangerous case for any child-protection system: real harm is high but the surface signals look fine, because the caregiver is fluent in institutional norms. attachment is already eroding, trust appears high, cultural distance is low. the system that only chases visible signals will miss this. a system that intervenes early on weak attachment will catch it.',
        seed: { state: state(0.74, 0.30, 0.35, 0.56, 0.68, 0.12, 0.22), belief: 0.32 },
        profile: CANONICAL,
        expectedFinalBelief: 0.62,
        expectedFamily: 80,
        expectedOutcomeIndex: 1,
        source: 'after research on detection-evading maltreatment; ECtHR jurisprudence on undetected harm.',
    },
    culturalMismatch: {
        key: 'culturalMismatch',
        label: 'cultural mismatch, low actual harm',
        subtitle: 'the immigrant / religious-family case. high cultural distance, no real abuse.',
        gloss:
            'a family with low actual harm risk but very high cultural distance from majority bureaucratic norms. attachment and family integrity are high. observations like "noncooperation" and "home disorder" can fire for cultural reasons, not because anyone is in danger. the canary for testing whether the model has too much culturalBias.',
        seed: { state: state(0.18, 0.66, 0.78, 0.88, 0.39, 0.82, 0.35), belief: 0.42 },
        profile: CANONICAL,
        expectedFinalBelief: 0.40,
        expectedFamily: 95,
        expectedOutcomeIndex: 0,
        source: 'after Norway Barnevernet ECtHR cases (2023); OsloMet research on bureaucratic culture in child welfare.',
    },
    povertyStress: {
        key: 'povertyStress',
        label: 'poverty stress, repairable care',
        subtitle: 'low harm under support, but high poverty pressure.',
        gloss:
            'a family whose problems are mostly structural: high poverty, mid caregiver capacity, but strong attachment and family integrity. with adequate support the trajectory bends down toward safer care. with surveillance-without-support the system inflates a fixable situation into a removal. the test of whether supportEffect and rightsCost are calibrated.',
        seed: { state: state(0.30, 0.46, 0.73, 0.82, 0.51, 0.30, 0.80), belief: 0.39 },
        profile: CANONICAL,
        expectedFinalBelief: 0.32,
        expectedFamily: 92,
        expectedOutcomeIndex: 0,
        source: 'after research on poverty / neglect conflation in child welfare; Bufdir Norway statistics on assistance vs care measures.',
    },
    severeDanger: {
        key: 'severeDanger',
        label: 'severe danger',
        subtitle: 'high actual harm, low attachment, low caregiver capacity.',
        gloss:
            'the case that justifies the system existing. harm risk is very high, caregiver capacity is collapsed, attachment is poor, family integrity is fragile. a child-protection system that fails this case has failed entirely. the calibration target for "system does what it is for".',
        seed: { state: state(0.88, 0.18, 0.22, 0.40, 0.28, 0.28, 0.48), belief: 0.62 },
        profile: CANONICAL,
        expectedFinalBelief: 0.85,
        expectedFamily: 70,
        expectedOutcomeIndex: 1,
        source: 'after Norway Bufdir care-order criteria; standard child-welfare crisis protocols.',
    },
};
