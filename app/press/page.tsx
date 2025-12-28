import type { Metadata } from 'next';

import { getPressItems } from './logic';
import PressList from './PressList';


export const metadata: Metadata = {
    title: 'press',
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
