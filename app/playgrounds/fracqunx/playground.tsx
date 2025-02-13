'use client';

import {
    useEffect,
    useState,
} from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';

import Board from './components/BoardRapier';



export default function FracqunxPlayground() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);

        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2"
        >
            <div
                className={`
                    absolute top-0 left-0 right-0 z-50
                    pointer-events-none
                    transition-opacity duration-300
                    hover:opacity-100
                    ${isLoaded ? 'opacity-30' : 'opacity-100'}
                `}
            >
                <div
                    className="flex justify-center"
                >
                    <Header />
                </div>

                <Title
                    text="fracqunx"
                />
            </div>

            <Board />
        </div>
    );
}
