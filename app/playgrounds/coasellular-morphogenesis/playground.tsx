'use client';

import {
    useState,
    useEffect,
} from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Input from '@/components/Input';

import PairOfCircles from './PairOfCircles';



export default function CoasellularMorphogenesisPlayground() {
    const [pointsCount, setPointsCount] = useState(12);
    const [points, setPoints] = useState(
        Array.from(
            { length: pointsCount },
            (_, i) => i
        ),
    );


    useEffect(() => {
        setPoints(
            Array.from(
                { length: pointsCount },
                (_, i) => i
            ),
        );
    }, [pointsCount]);


    return (
        <div
            className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2"
        >
            <Header />

            <Title
                text="coasellular morphogenesis"
            />

            <div
                className="max-w-80 mb-6 text-center"
            >
                <p>
                    bioelectric and cellular agents interactions and negotiations based on Coasean transaction costs
                </p>

                <p>
                    each circle has energy for transactions and uses the others as its memory; as they spin, each circle accesses the other&apos;s state to recall its initial configuration, negotiating to restore it
                </p>
            </div>

            <div>
                <Input
                    label="points count"
                    value={pointsCount}
                    onChange={(value) => {
                        setPointsCount(parseInt(value));
                    }}
                />
            </div>

            <div
                className="flex flex-row items-center justify-center"
            >
                <PairOfCircles
                    points={points}
                    speed={2}
                />
            </div>

            <div
                className="min-h-[100px]"
            />
        </div>
    );
}
