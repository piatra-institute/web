'use client';

import {
    useState,
    useEffect,
} from 'react';

import Image from 'next/image';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Input from '@/components/Input';



export default function EstigradePlayground() {
    const [
        reward,
        setReward,
    ] = useState(0.1);

    const [
        penalty,
        setPenalty,
    ] = useState(0.2);

    const [
        estimatedGrade,
        setEstimatedGrade,
    ] = useState(80);

    const [
        actualGrade,
        setActualGrade,
    ] = useState(80);

    const [
        finalGrade,
        setFinalGrade,
    ] = useState(0);


    useEffect(() => {
        const computeFinalGrade = () => {
            const gradeDifference = Math.abs(actualGrade - estimatedGrade);

            return parseInt(
                (
                    actualGrade + reward * (100 - gradeDifference) - penalty * gradeDifference
                ).toFixed(2)
            );
        }

        const finalGrade = computeFinalGrade();
        setFinalGrade(finalGrade);
    }, [
        reward,
        penalty,
        estimatedGrade,
        actualGrade,
    ]);

    return (
        <div
            className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2"
        >
            <Header />

            <Title
                text="estigrade"
            />

            <div
                className="max-w-80 mb-6 text-center"
            >
                enhances grades when students accurately estimate their exam scores
            </div>

            <div
                className="mb-8 text-center"
            >
                {/* \textbf{final} = \textbf{exam} + r \times (100 - |\textbf{exam} - \textbf{estimated}|) - p \times |\textbf{exam} - \textbf{estimated}| */}
                <Image
                    src="/assets-playgrounds/estigrade/estigrade-formula.png"
                    alt="estigrade formula"
                    height={22}
                    width={700}
                    draggable={false}
                />
            </div>

            <div>
                <Input
                    value={reward}
                    onChange={(e) => {
                        const value = parseFloat(e);
                        if (isNaN(value)) {
                            return;
                        }
                        setReward(value);
                    }}
                    label="[r]eward"
                    compact={true}
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                />

                <Input
                    value={penalty}
                    onChange={(e) => {
                        const value = parseFloat(e);
                        if (isNaN(value)) {
                            return;
                        }
                        setPenalty(value);
                    }}
                    label="[p]enalty"
                    compact={true}
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                />

                <Input
                    value={estimatedGrade}
                    onChange={(e) => {
                        const value = parseInt(e);
                        if (isNaN(value)) {
                            return;
                        }
                        setEstimatedGrade(value);
                    }}
                    label="[estimated] grade"
                    compact={true}
                    type="number"
                    min={0}
                    max={100}
                />

                <Input
                    value={actualGrade}
                    onChange={(e) => {
                        const value = parseInt(e);
                        if (isNaN(value)) {
                            return;
                        }
                        setActualGrade(value);
                    }}
                    label="[exam] grade"
                    compact={true}
                    type="number"
                    min={0}
                    max={100}
                />

                <div
                    className="flex justify-between mt-8"
                >
                    <div>
                        [final] grade
                    </div>

                    <div>
                        {finalGrade}
                    </div>
                </div>
            </div>
        </div>
    );
}
