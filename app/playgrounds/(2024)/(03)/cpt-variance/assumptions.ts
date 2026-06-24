import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'cpt-theorem',
        statement:
            'any local, Lorentz-invariant quantum field theory with a Hermitian Hamiltonian is invariant under the combined CPT operation. CPT is the protected symmetry, even where C, P, T and their pairs are individually broken.',
        citation:
            'Luders 1954 and Pauli 1955; Streater and Wightman, PCT, Spin and Statistics, and All That (1964).',
        confidence: 'established',
        falsifiability:
            'a reproducible difference between a particle and its antiparticle in mass, lifetime or charge magnitude would violate CPT; current kaon and antihydrogen tests bound it to better than one part in 10^18.',
    },
    {
        id: 'discrete-involutions',
        statement:
            'C, P and T are modelled as exact linear involutions on a classical state: C flips charge and species, P inverts spatial coordinates and momenta, T reverses momenta. Each applied twice is the identity.',
        citation:
            'standard discrete-symmetry algebra in quantum field theory; the operators generate a finite group with CPT as a distinguished element.',
        confidence: 'established',
        falsifiability:
            'in full QFT T is antiunitary and acts on spinor phases, not a simple sign flip; the toy drops these phases, so any prediction depending on spinor structure is outside its scope.',
    },
    {
        id: 'classical-state',
        statement:
            'a particle is reduced to position, momentum, charge and a matter/antimatter label. spin, helicity, internal quantum numbers and the field operators themselves are omitted.',
        citation:
            'modelling choice for legibility; the visualisation targets the geometric action of C, P, T rather than amplitude-level dynamics.',
        confidence: 'contested',
        falsifiability:
            'parity violation in the weak interaction is fundamentally about helicity (left-handed neutrinos); a state without spin cannot reproduce that mechanism and only caricatures it.',
    },
    {
        id: 'violation-sliders',
        statement:
            'the C, P, T "violation" sliders are a toy opacity/strength control, not a measured branching ratio. they soften individual symmetries for display while CPT remains the conserved quantity.',
        citation:
            'phenomenological choice; real violations are quantified by observables such as the kaon parameter epsilon and Jarlskog invariant, not a single 0 to 1 dial.',
        confidence: 'speculative',
        falsifiability:
            'no experiment sets a "30% parity violation"; the slider has no direct empirical counterpart and should be read as illustrative only.',
    },
    {
        id: 'matter-asymmetry-linear',
        statement:
            'the matter-antimatter asymmetry is taken to be linear in the CPT-violating parameter eps: matter fraction 0.5 + 5 eps, antimatter 0.5 - 5 eps, so the asymmetry is 10 eps and vanishes at eps = 0.',
        citation:
            'illustrative linearisation; the observed baryon asymmetry is about 6 x 10^-10 and arises from the Sakharov conditions, not a single linear knob.',
        confidence: 'speculative',
        falsifiability:
            'real baryogenesis needs C and CP violation, baryon-number violation and departure from equilibrium together; a lone linear CPT term is not a viable mechanism.',
    },
    {
        id: 'individual-vs-combined',
        statement:
            'individual C, P and CP are known to be violated in the weak interaction, while CPT has never been observed to break. the playground keeps this separation: users may break C, P, T at will but the combined CPT result stays distinguished.',
        citation:
            'Wu et al. 1957 (parity violation); Christenson, Cronin, Fitch, Turlay 1964 (CP violation in kaons); no observed CPT violation to date.',
        confidence: 'established',
        falsifiability:
            'the entire framing collapses if CPT violation were confirmed; that is precisely the high-stakes null result that ongoing antimatter experiments pursue.',
    },
];
