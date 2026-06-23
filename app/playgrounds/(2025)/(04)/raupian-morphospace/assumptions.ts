import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'logarithmic-spiral',
        statement:
            'the shell is modelled as a generating curve sweeping along a logarithmic spiral about a fixed axis. self-similar (equiangular) growth is the geometric core of Raup\'s model.',
        citation:
            'Raup 1966, Geometric Analysis of Shell Coiling; logarithmic-spiral growth is a long-standing description of mollusc shells.',
        confidence: 'established',
        falsifiability:
            'shells whose whorls do not grow self-similarly (changing expansion rate along ontogeny) depart from a single-spiral description.',
    },
    {
        id: 'three-parameters',
        statement:
            'shell form is reduced to three numbers: whorl expansion rate W, distance from the axis D, and translation rate T. this captures gross coiling geometry but not ornament, ribbing, aperture shape, or allometric change.',
        citation:
            'Raup\'s three-parameter (originally four-parameter) morphospace.',
        confidence: 'contested',
        falsifiability:
            'two shells with identical W, D, T but visibly different real morphology show the parameters are an incomplete description.',
    },
    {
        id: 'whorl-expansion',
        statement:
            'W is defined so that the spiral radius grows by a factor of exactly W per full revolution (and W^n over n whorls). this is an exact geometric relation, checked by the calibration.',
        citation:
            'definition of the whorl expansion rate in the logarithmic-spiral model.',
        confidence: 'established',
        falsifiability:
            'if the computed radius ratio per turn differed from W, the spiral implementation would be wrong.',
    },
    {
        id: 'viewer-sensitivity-tweak',
        statement:
            'the 3D viewer applies an extra sensitivity exponent to W so the slider feels responsive on screen, so the rendered per-whorl expansion is not the raw slider value. the calibration deliberately uses the canonical relation, not the visual tweak.',
        citation:
            'implementation detail of the renderer (W_effective = W^sensitivity).',
        confidence: 'established',
        falsifiability:
            'measuring the on-screen expansion against the slider would reveal the visual remapping; the underlying mathematics is still the canonical spiral.',
    },
    {
        id: 'theoretical-morphospace',
        statement:
            'most of the W-D-T cube corresponds to shell forms that do not occur in nature; real shells cluster in limited regions. the empty space reflects functional and developmental constraints, not just possibility.',
        citation:
            'Raup\'s central finding that realized morphospace is a small subset of theoretical morphospace.',
        confidence: 'established',
        falsifiability:
            'discovery of shells densely occupying currently-empty regions would weaken the constraint interpretation.',
    },
    {
        id: 'geometric-not-developmental',
        statement:
            'this is a descriptive geometric model of the finished form, not a model of how the shell is actually secreted and grown. it does not explain the developmental or genetic basis of coiling.',
        citation:
            'distinction between theoretical morphology and developmental mechanism.',
        confidence: 'contested',
        falsifiability:
            'a developmental model could predict which parameter combinations are reachable by real growth, which this geometry alone cannot.',
    },
];
