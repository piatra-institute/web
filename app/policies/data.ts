import { PolicySectionData } from '@/components/PolicySection';
import { PolicyTimelinePhase } from '@/components/PolicyTimeline';
import { PolicyFAQItem } from '@/components/PolicyFAQ';
import { PolicyCTAAudience } from '@/components/PolicyCTA';
import { PolicyDownloadItem } from '@/components/PolicyDownloads';
import { PolicyDemonstratorData } from '@/components/PolicyDemonstrator';

import { cerbContent } from './data/cerb';
import { romaniaToEmblContent } from './data/romania-to-embl';
import { openAdasDaciaContent } from './data/open-adas-dacia';


export interface PolicyMetadata {
    path: string;
    name: string;
    title: string;
    subtitle?: string;
    tagline?: string;
    date: string;
    status: string;
    description: string;
    pdf?: string;
    pdfLabel?: string;
    bodyNames?: { primary: string; secondary?: string }[];
}

export interface PolicyContent {
    executiveSummary: string[];
    sections: PolicySectionData[];
    demonstrator?: PolicyDemonstratorData;
    timeline?: {
        heading?: string;
        phases: PolicyTimelinePhase[];
        footer?: string;
    };
    faq?: PolicyFAQItem[];
    cta?: {
        heading?: string;
        lead?: string;
        audiences?: PolicyCTAAudience[];
        contactEmail?: string;
        contactLabel?: string;
        footnote?: string;
    };
    downloads?: PolicyDownloadItem[];
}

export type Policy = PolicyMetadata & PolicyContent;


const metadata: PolicyMetadata[] = [
    {
        path: 'romania-to-embl',
        name: 'Romania → EMBL Membership Roadmap 2026-2030',
        title: 'Romania → EMBL',
        subtitle: 'Accession Roadmap, 2026-2030',
        tagline: 'Building Romanian biomedical capacity inside European research infrastructure',
        date: '2026-03',
        status: 'roadmap published; execution under way',
        description: 'staged roadmap for Romania\'s accession to the European Molecular Biology Laboratory over 2026-2030, framed as a capacity-building commitment anchored in multi-year legislation.',
        pdf: '/policies/romania-to-embl-roadmap.pdf',
        pdfLabel: 'roadmap',
    },
    {
        path: 'cerb',
        name: 'CERB: Centre Européen de Reprogrammation Biologique',
        title: 'CERB',
        subtitle: 'Centre Européen de Reprogrammation Biologique',
        tagline: 'from atlas to compiler, and keeping what Europe builds',
        date: '2026-04',
        status: 'draft, open for endorsement',
        description: 'proposal for a CERN-class European biology infrastructure that moves research from descriptive atlas-building to programmable control of anatomical form',
        pdf: '/policies/cerb-position-paper.pdf',
        pdfLabel: 'position paper',
        bodyNames: [
            { primary: 'Conseil Européen pour la Reprogrammation Biologique', secondary: 'treaty body' },
            { primary: 'Centre Européen de Reprogrammation Biologique', secondary: 'operating institution' },
        ],
    },
    {
        path: 'open-adas-dacia',
        name: 'Open ADAS Dacia: openpilot for the post-2026 Dacia range',
        title: 'Open ADAS Dacia',
        subtitle: 'An Open-Source Engineering Offer for the Post-2026 Dacia Range',
        tagline: 'openpilot for Dacia, engineered in Romania, published open source',
        date: '2026-05',
        status: 'draft, open for endorsement',
        description: 'Piatra . Institute proposes to engineer and publish, under an open-source licence, an openpilot port supporting the post-2026 Dacia range (Sandero, Logan, Duster, Bigster, the upcoming Striker), in exchange for managed engineering access from Renault Group and Dacia and operational cooperation from a Romanian fleet partner.',
        pdf: '/policies/open-adas-dacia-position-paper.pdf',
        pdfLabel: 'position paper',
    },
];


export const policies: Policy[] = [
    { ...metadata.find(m => m.path === 'romania-to-embl')!, ...romaniaToEmblContent },
    { ...metadata.find(m => m.path === 'cerb')!, ...cerbContent },
    { ...metadata.find(m => m.path === 'open-adas-dacia')!, ...openAdasDaciaContent },
];


export const findPolicyByPath = (path: string): Policy | undefined => {
    return policies.find(p => p.path === path);
};
