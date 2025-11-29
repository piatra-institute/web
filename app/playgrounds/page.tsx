import type { Metadata } from 'next';

import Header from '@/components/Header';
import Title from '@/components/Title';

import PlaygroundsList from './PlaygroundsList';


export const metadata: Metadata = {
    title: 'playgrounds',
};


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
                className="max-w-[600px] text-center mb-12"
            >
                the playgrounds are in various stages of development
                <br />
                from conceptual sketches to fully functional applications
            </div>

            <PlaygroundsList />
        </div>
    );
}
