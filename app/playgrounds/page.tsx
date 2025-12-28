import type { Metadata } from 'next';

import PlaygroundsList from './PlaygroundsList';


export const metadata: Metadata = {
    title: 'playgrounds',
};


export default function Playgrounds() {
    return <PlaygroundsList />;
}
