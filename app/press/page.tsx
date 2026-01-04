import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import { getPressItems } from './logic';
import PressList from './components/PressList';



export const metadata: Metadata = {
    title: 'press',
    description: 'publications and translations',

    openGraph: {
        ...defaultOpenGraph,
        title: 'press · piatra.institute',
        description: 'publications and translations',
    },
};


const otherPress = [
    {
        link: 'https://github.com/piatra-institute/deep-representation-learning-book',
        title: 'Învățarea Reprezentărilor Profunde ale Distribuțiilor de Date',
        originalTitle: 'Learning Deep Representations of Data Distributions',
        authors: 'Sam Buchanan, Druv Pai, Peng Wang, Yi Ma',
        year: '2025',
        doi: 'https://doi.org/10.5281/zenodo.17024756',
    },
];


export default function Press() {
    const pressItems = getPressItems();

    return (
        <PressList
            pressItems={pressItems}
            otherPress={otherPress}
        />
    );
}
