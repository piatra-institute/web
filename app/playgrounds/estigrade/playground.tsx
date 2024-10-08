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
        examGrade,
        setExamGrade,
    ] = useState(80);

    const [
        finalGrade,
        setFinalGrade,
    ] = useState(0);


    useEffect(() => {
        const computeFinalGrade = () => {
            const gradeDifference = Math.abs(examGrade - estimatedGrade);

            return parseInt(
                (
                    examGrade + reward * (100 - gradeDifference) - penalty * gradeDifference
                ).toFixed(2)
            );
        }

        const finalGrade = computeFinalGrade();
        setFinalGrade(finalGrade);
    }, [
        reward,
        penalty,
        estimatedGrade,
        examGrade,
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
                enhance grades when students accurately estimate their exam scores
            </div>

            <div
                className="max-w-[300px] p-4 min-h-[22px] overflow-auto md:max-w-[700px] mb-8 text-center"
            >
                {/* \textbf{final} = \textbf{exam} + r \times (100 - |\textbf{exam} - \textbf{estimated}|) - p \times |\textbf{exam} - \textbf{estimated}| */}
                <Image
                    src="/assets-playgrounds/estigrade/estigrade-formula.png"
                    alt="estigrade formula"
                    className="select-none"
                    height={22}
                    width={600}
                    priority={true}
                    draggable={false}
                    style={{
                        width: '600px',
                        height: '22px',
                        maxWidth: 'initial',
                    }}
                />
            </div>

            <div>
                <Input
                    value={reward}
                    onChange={(e) => {
                        const value = parseFloat(e);
                        if (isNaN(value)) {
                            setReward(0);
                            return;
                        }

                        if (value < 0) {
                            setReward(0);
                            return;
                        }

                        if (value > 1) {
                            setReward(1);
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
                    inputMode="decimal"
                />

                <Input
                    value={penalty}
                    onChange={(e) => {
                        const value = parseFloat(e);
                        if (isNaN(value)) {
                            setPenalty(0);
                            return;
                        }

                        if (value < 0) {
                            setPenalty(0);
                            return;
                        }

                        if (value > 1) {
                            setPenalty(1);
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
                    inputMode="decimal"
                />

                <Input
                    value={parseInt(estimatedGrade + '', 10) || ""}
                    onChange={(e) => {
                        const value = parseInt(e);
                        if (isNaN(value)) {
                            setEstimatedGrade(0);
                            return;
                        }

                        if (value < 0) {
                            setEstimatedGrade(0);
                            return;
                        }

                        if (value > 100) {
                            setEstimatedGrade(100);
                            return;
                        }

                        setEstimatedGrade(value);
                    }}
                    label="[estimated] grade"
                    compact={true}
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                />

                <Input
                    value={parseInt(examGrade + '', 10) || ""}
                    onChange={(e) => {
                        const value = parseInt(e);
                        if (isNaN(value)) {
                            setExamGrade(0);
                            return;
                        }

                        if (value < 0) {
                            setExamGrade(0);
                            return;
                        }

                        if (value > 100) {
                            setExamGrade(100);
                            return;
                        }

                        setExamGrade(value);
                    }}
                    label="[exam] grade"
                    compact={true}
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                />

                <div
                    className="flex justify-between mt-8"
                >
                    <div>
                        [final] grade
                    </div>

                    <div
                        className="px-4 xl:px-8"
                    >
                        {finalGrade}
                    </div>
                </div>
            </div>
        </div>
    );
}
