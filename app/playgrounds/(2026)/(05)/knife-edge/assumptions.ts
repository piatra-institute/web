import { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'critical-power-law',
        statement:
            'At criticality, avalanche-size distributions become approximately power-law: P(s) ~ s^-τ with τ ≈ 3/2 in mean-field branching processes.',
        citation:
            'Harris, 1989, The Theory of Branching Processes; Beggs & Plenz, 2003, Neuronal Avalanches in Neocortical Circuits',
        confidence: 'established',
        falsifiability:
            'Long high-resolution recordings of a system reported to be critical that show avalanche distributions decaying exponentially or with τ persistently outside the universality range.',
    },
    {
        id: 'correlation-length-divergence',
        statement:
            'The correlation length ξ scales as |t|^-ν with t = (gain - gain_c)/gain_c and diverges as the system approaches criticality.',
        citation:
            'Goldenfeld, 1992, Lectures on Phase Transitions and the Renormalization Group',
        confidence: 'established',
        falsifiability:
            'A system tuned to its critical point that retains a finite correlation length unchanged from the off-critical phase.',
    },
    {
        id: 'lambda-max-bifurcation',
        statement:
            'The dominant linearised eigenvalue λ_max changes sign at a bifurcation: λ_max < 0 means perturbations decay, λ_max > 0 means they grow exponentially until nonlinearity intervenes.',
        citation:
            'Strogatz, 1994, Nonlinear Dynamics and Chaos',
        confidence: 'established',
        falsifiability:
            'A linearisable system where λ_max < 0 yet sustained activity is observed, or λ_max > 0 yet nothing grows on the linear timescale.',
    },
    {
        id: 'cubic-saturation',
        statement:
            'Real critical systems saturate via nonlinear feedback (here cubic) once amplitudes exceed unity, preventing literal divergence.',
        citation:
            'Generic normal-form argument; Cross & Hohenberg, 1993, Pattern Formation Outside of Equilibrium',
        confidence: 'established',
        falsifiability:
            'A natural system claimed to be supercritical that exhibits unbounded amplitude growth without saturation, fragmentation, or pattern selection.',
    },
    {
        id: 'cellular-sheaf',
        statement:
            'A cellular sheaf assigns local stalks to patches of the lattice with restriction maps to overlap edges; its Laplacian has kernel ker L_F ≅ H^0(X; F), the global sections.',
        citation:
            'Hansen & Ghrist, 2019, Toward a Spectral Theory of Cellular Sheaves',
        confidence: 'established',
        falsifiability:
            'A worked example in which the published spectral theory of cellular sheaves contradicts the kernel-cohomology correspondence.',
    },
    {
        id: 'sheaf-criticality-link',
        statement:
            'The sheaf spectral gap shrinks near criticality because heterogeneous patch activity weakens restriction maps; near-zero eigenvalues correspond to almost-global sections.',
        citation:
            'Robinson, 2018, Assignments to Sheaves of Pseudometric Spaces',
        confidence: 'speculative',
        falsifiability:
            'Constructing a cellular sheaf whose spectral gap is invariant under the substrate dynamics, or whose gap collapse occurs far from any critical bifurcation.',
    },
    {
        id: 'consciousness-criticality',
        statement:
            'Conscious neural states tend to operate near a branching ratio of 1; pharmacological loss of consciousness shifts dynamics away from criticality, while ketamine preserves near-critical dynamics.',
        citation:
            'Maschke et al., 2024, Communications Biology, Anesthetics shift cortical critical dynamics',
        confidence: 'contested',
        falsifiability:
            'Anaesthetic agents that abolish consciousness without measurable shift in the avalanche τ-fit, branching ratio, or spectral gap of cortical activity.',
    },
    {
        id: 'mean-field-approximation',
        statement:
            'Averaging the lattice and using a single mean-field linearised growth rate is a coarse approximation; real systems may have spatially heterogeneous λ_max.',
        citation:
            'Stanley, 1971, Introduction to Phase Transitions and Critical Phenomena',
        confidence: 'established',
        falsifiability:
            'Empirical lattice systems where local critical points differ enough that a single λ_max poorly predicts the global regime.',
    },
    {
        id: 'lattice-discretisation',
        statement:
            'A 96-site 1D periodic lattice is sufficient to display power-law avalanche signatures over ≈1.5 decades but undersamples low-frequency long-range fluctuations.',
        citation:
            'Empirical observation in finite-size scaling of branching processes',
        confidence: 'established',
        falsifiability:
            'Showing that the qualitative regime classification flips when the lattice size is doubled or quadrupled under identical parameter settings.',
    },
    {
        id: 'normalised-units',
        statement:
            'Time, amplitude, and field units are dimensionless. The model is calibrated to the demo physics, not to any specific neural, optical, or fluid system.',
        citation: 'Modelling choice for interpretability',
        confidence: 'established',
        falsifiability:
            'Not empirically falsifiable, a stipulated normalisation. The qualitative phase structure is what carries scientific content, not the absolute numbers.',
    },
];
