import type { Metadata } from 'next';

import Link from 'next/link';

import Header from '@/components/Header';
import Title from '@/components/Title';

import {
    linkAnchorStyle,
} from '@/data/styles';



export const metadata: Metadata = {
    title: 'playgrounds',
};


const playgrounds = [
    {
        name: 'self-sorted arrays',
        link: '/playgrounds/self-sorted-arrays',
        description: 'cell-based sorting algorithms',
        date: 'February 2024',
    },
    {
        name: 'estigrade',
        link: '/playgrounds/estigrade',
        description: 'grade estimation',
        date: 'September 2024',
    },
    {
        name: 'coasellular morphogenesis',
        link: '/playgrounds/coasellular-morphogenesis',
        description: 'Coase theorem applied to cellular development and transaction costs',
        date: 'November 2024',
    },
    {
        name: 'fracqunx',
        link: '/playgrounds/fracqunx',
        description: 'fractional quincunx',
        date: 'February 2025',
    },
    {
        name: 'Halley window',
        link: '/playgrounds/halley-window',
        description: 'Halley\'s method fractal patterns',
        date: 'February 2025',
    },
    // {
    //     name: 'eyevolution',
    //     link: '/playgrounds/eyevolution',
    //     description: '',
    //     date: 'March 2024',
    // },
    // {
    //     name: 'pacemaker-accumulator',
    //     link: '/playgrounds/pacemaker-accumulator',
    //     description: '',
    //     date: 'March 2024',
    // },
    // {
    //     name: 'cpt-variance',
    //     link: '/playgrounds/cpt-variance',
    //     description: '',
    //     date: 'March 2024',
    // },
    // {
    //     name: 'refractive computation',
    //     link: '/playgrounds/refractive-computation',
    //     description: '',
    //     date: 'March 2024',
    // },
    // {
    //     name: 'metamaterials',
    //     link: '/playgrounds/metamaterials',
    //     description: '',
    //     date: 'March 2024',
    // },
    // {
    //     name: 'lifesong',
    //     link: '/playgrounds/lifesong',
    //     description: '',
    //     date: 'March 2024',
    // },
    // {
    //     name: 'vote no',
    //     link: '/playgrounds/vote-no',
    //     description: '',
    //     date: 'March 2024',
    // },
    // {
    //     name: 'everything... relevant',
    //     link: '/playgrounds/everything-relevant',
    //     description: '',
    //     date: 'March 2024',
    // },
    {
        name: 'Raupian morphospace',
        link: '/playgrounds/raupian-morphospace',
        description: 'coiling models',
        date: 'April 2025',
    },
    {
        name: 'Hsp90 canalization',
        link: '/playgrounds/hsp90-canalization',
        description: 'chaperone-driven canalization of latent phenotypic variation',
        date: 'April 2025',
    },
    {
        name: 'Lefebvrian conscience',
        link: '/playgrounds/lefebvrian-conscience',
        description: 'algebra of conscience',
        date: 'May 2025',
    },
    {
        name: 'bifurcation speciation',
        link: '/playgrounds/bifurcation-speciation',
        description: 'sympatric and allopatric speciation through bifurcation',
        date: 'May 2025',
    },
    {
        name: 'stochastic justice',
        link: '/playgrounds/stochastic-justice',
        description: 'fairness through randomness in corrupt systems',
        date: 'June 2025',
    },
    {
        name: 'trauma-eustress dynamics',
        link: '/playgrounds/trauma-eustress-dynamics',
        description: 'constriction and expansion influence on post-trauma trajectories',
        date: 'June 2025',
    },
    {
        name: 'open source sustainability',
        link: '/playgrounds/open-source-sustainability',
        description: 'pressure dynamics in open source license transitions',
        date: 'June 2025',
    },
    {
        name: 'resentment against desire',
        link: '/playgrounds/resentment-against-desire',
        description: 'the psychology of fairness in the ultimatum game',
        date: 'June 2025',
    },
    {
        name: 'debt singularity',
        link: '/playgrounds/debt-singularity',
        description: 'phase transitions of debt through economic conditions',
        date: 'June 2025',
    },
    // {
    //     name: 'entropy café',
    //     link: '/playgrounds/entropy-cafe',
    //     description: 'entropy and complexity through coffee mixing metaphor',
    //     date: 'July 2025',
    // },
    {
        name: 'geometry becoming topology',
        link: '/playgrounds/geometry-becoming-topology',
        description: 'the transformation from geometric to topological properties',
        date: 'July 2025',
    },
    {
        name: 'crystallographic groups',
        link: '/playgrounds/crystallographic-groups',
        description: 'symmetry patterns in 2D, 3D, and 4D',
        date: 'July 2025',
    },
    {
        name: 'story-suffering coherence',
        link: '/playgrounds/story-suffering-coherence',
        description: 'narrative emergence from suffering integration',
        date: 'July 2025',
    },
    {
        name: 'ramsey ports',
        link: '/playgrounds/ramsey-ports',
        description: 'welfare economics of airport pricing strategies',
        date: 'July 2025',
    },
    {
        name: 'expected free energy',
        link: '/playgrounds/expected-free-energy',
        description: 'Monte Carlo visualization of active inference',
        date: 'July 2025',
    },
    {
        name: 'criticality',
        link: '/playgrounds/criticality',
        description: 'branching processes and distance-to-criticality metrics',
        date: 'July 2025',
    },
    {
        name: 'meaning autogenesis',
        link: '/playgrounds/meaning-autogenesis',
        description: 'biosemiotic emergence from molecule to sign',
        date: 'July 2025',
    },
    {
        name: 'agency erosion',
        link: '/playgrounds/agency-erosion',
        description: 'identity substitution dynamics in amplified environments',
        date: 'July 2025',
    },
    {
        name: 'berkshire engine',
        link: '/playgrounds/berkshire-engine',
        description: 'insurance float as investment capital',
        date: 'August 2025',
    },
    {
        name: 'authoritarian paternalism',
        link: '/playgrounds/authoritarian-paternalism',
        description: 'dark agent simulation of paternal authority dynamics',
        date: 'August 2025',
    },
];


export default function Playgrounds() {
    return (
        <div
            className="flex flex-col items-center justify-center w-full min-h-full select-none"
        >
            <Header />

            <Title
                text="playgrounds"
            />

            <div
                className="max-w-[600px] text-center mb-4"
            >
                the playgrounds are in various stages of development
                <br />
                varying from conceptual sketches to fully functional applications
            </div>

            <div
                className="p-6"
            >
                {playgrounds.map((playground) => {
                    const {
                        name,
                        link,
                        description,
                        date,
                    } = playground;

                    return (
                        <Link
                            key={name + link}
                            href={link}
                            className="mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center"
                            draggable={false}
                        >
                            <div
                                className={linkAnchorStyle}
                            >
                                {name} · {date}
                            </div>

                            {description && (
                                <div>
                                    {description}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
