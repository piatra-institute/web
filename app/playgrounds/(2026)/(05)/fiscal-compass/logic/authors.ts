import { SchoolKey } from './model';

// The author map. Each name is placed under the rationale they are the
// strongest reference for, with the angle they argue from and the tax
// instrument most associated with their work.

export interface AuthorProfile {
    name: string;
    school: SchoolKey;
    angle: string;
    signatureTax: string;
    keyWork: string;
}

export const AUTHOR_PROFILES: AuthorProfile[] = [
    // redistribution
    {
        name: 'Thomas Piketty',
        school: 'redistribution',
        angle: 'capital accumulation and wealth concentration',
        signatureTax: 'progressive wealth and inheritance tax',
        keyWork: 'Capital in the Twenty-First Century, 2013',
    },
    {
        name: 'Emmanuel Saez',
        school: 'redistribution',
        angle: 'optimal top marginal tax rates',
        signatureTax: 'top income and capital gains tax',
        keyWork: 'Diamond & Saez, The Case for a Progressive Tax, 2011',
    },
    {
        name: 'Gabriel Zucman',
        school: 'redistribution',
        angle: 'tax avoidance and the measurement of wealth',
        signatureTax: 'global minimum wealth tax',
        keyWork: 'The Hidden Wealth of Nations, 2015',
    },
    {
        name: 'Anthony Atkinson',
        school: 'redistribution',
        angle: 'a concrete policy programme against inequality',
        signatureTax: 'progressive income and inheritance tax',
        keyWork: 'Inequality: What Can Be Done?, 2015',
    },
    {
        name: 'Peter Diamond',
        school: 'redistribution',
        angle: 'optimal taxation theory',
        signatureTax: 'high top marginal income tax',
        keyWork: 'Diamond & Saez, The Case for a Progressive Tax, 2011',
    },
    // state capacity
    {
        name: 'Joseph Stiglitz',
        school: 'state-capacity',
        angle: 'inequality, rents, and the returns to public goods',
        signatureTax: 'rent, capital, and progressive taxes',
        keyWork: 'The Price of Inequality, 2012',
    },
    {
        name: 'Mariana Mazzucato',
        school: 'state-capacity',
        angle: 'mission-oriented public investment',
        signatureTax: 'capturing returns from public value',
        keyWork: 'The Entrepreneurial State, 2013',
    },
    {
        name: 'Richard Musgrave',
        school: 'state-capacity',
        angle: 'the allocation, distribution, and stabilization functions of the state',
        signatureTax: 'broad, well-designed tax systems',
        keyWork: 'The Theory of Public Finance, 1959',
    },
    {
        name: 'Peter Lindert',
        school: 'state-capacity',
        angle: 'the historical growth record of large welfare states',
        signatureTax: 'social-spending finance',
        keyWork: 'Growing Public, 2004',
    },
    {
        name: 'James Mirrlees',
        school: 'state-capacity',
        angle: 'designing taxes to balance equity and incentives',
        signatureTax: 'optimal income taxation',
        keyWork: 'The Mirrlees Review, 2011',
    },
    // consolidation
    {
        name: 'Olivier Blanchard',
        school: 'consolidation',
        angle: 'debt sustainability under interest-growth dynamics',
        signatureTax: 'context-dependent consolidation',
        keyWork: 'Public Debt and Low Interest Rates, 2019',
    },
    {
        name: 'Carmen Reinhart',
        school: 'consolidation',
        angle: 'debt overhang and financial crises',
        signatureTax: 'fiscal repair',
        keyWork: 'Reinhart & Rogoff, This Time Is Different, 2009',
    },
    {
        name: 'Kenneth Rogoff',
        school: 'consolidation',
        angle: 'debt, crises, and long-run growth',
        signatureTax: 'fiscal repair',
        keyWork: 'Reinhart & Rogoff, This Time Is Different, 2009',
    },
    {
        name: 'Alberto Alesina',
        school: 'consolidation',
        angle: 'the expansionary-austerity debate (usually prefers spending cuts)',
        signatureTax: 'spending-based consolidation',
        keyWork: 'Austerity: When It Works and When It Doesn’t, 2019',
    },
    {
        name: 'Roberto Perotti',
        school: 'consolidation',
        angle: 'composition effects in fiscal adjustments',
        signatureTax: 'spending-based consolidation',
        keyWork: 'The Effects of Fiscal Consolidations, 2011',
    },
    // corrective
    {
        name: 'Arthur Pigou',
        school: 'corrective',
        angle: 'corrective taxation of externalities',
        signatureTax: 'pollution and harm taxes',
        keyWork: 'The Economics of Welfare, 1920',
    },
    {
        name: 'William Nordhaus',
        school: 'corrective',
        angle: 'the economics of climate change',
        signatureTax: 'carbon tax',
        keyWork: 'The Climate Casino, 2013',
    },
    {
        name: 'Martin Weitzman',
        school: 'corrective',
        angle: 'prices versus quantities under uncertainty',
        signatureTax: 'carbon pricing',
        keyWork: 'Prices vs. Quantities, 1974',
    },
    {
        name: 'Nicholas Stern',
        school: 'corrective',
        angle: 'climate risk and the welfare of future generations',
        signatureTax: 'carbon tax and climate policy',
        keyWork: 'The Stern Review, 2006',
    },
];

export function searchAuthors(query: string): AuthorProfile[] {
    const q = query.trim().toLowerCase();
    if (!q) return AUTHOR_PROFILES;
    return AUTHOR_PROFILES.filter((a) => {
        const hay = `${a.name} ${a.angle} ${a.signatureTax} ${a.keyWork} ${a.school}`.toLowerCase();
        return hay.includes(q);
    });
}
