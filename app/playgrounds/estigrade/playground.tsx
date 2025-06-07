'use client';

import {
    useState,
    useEffect,
} from 'react';

import Image from 'next/image';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
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

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'calculator',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="flex flex-col items-center">
                        <div className="max-w-[300px] p-4 min-h-[22px] overflow-auto md:max-w-[700px] mb-8 text-center">
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

                        <div className="flex justify-between mt-8 mb-12 text-xl font-bold">
                            <div>Final Grade:</div>
                            <div className="px-4 xl:px-8 text-green-400">
                                {finalGrade}
                            </div>
                        </div>
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                        <p>
                            Estigrade is an experimental grading system designed to develop students' metacognitive skills
                            by incentivizing accurate self-assessment. Before taking an exam, students estimate their
                            expected score. Their final grade is then adjusted based on the accuracy of this prediction.
                        </p>
                        <p>
                            The formula balances two components: a reward for accurate estimation and a penalty for
                            inaccuracy. When students correctly predict their performance, they receive bonus points.
                            When they're off the mark, points are deducted.
                        </p>
                        <p>
                            This approach encourages students to develop better self-awareness about their knowledge
                            and preparation level, ultimately leading to improved learning outcomes and more realistic
                            self-assessment skills that are valuable beyond the classroom.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Grade Estimation Parameters',
                    content: (
                        <>
                            <Input
                                value={estimatedGrade}
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
                                label="Estimated Grade"
                                compact={true}
                                type="number"
                                min={0}
                                max={100}
                                inputMode="numeric"
                            />
                            <Input
                                value={examGrade}
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
                                label="Actual Exam Grade"
                                compact={true}
                                type="number"
                                min={0}
                                max={100}
                                inputMode="numeric"
                            />
                        </>
                    ),
                },
                {
                    title: 'Adjustment Factors',
                    content: (
                        <>
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
                                label="Reward Factor (r)"
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
                                label="Penalty Factor (p)"
                                compact={true}
                                type="number"
                                min={0}
                                max={1}
                                step={0.1}
                                inputMode="decimal"
                            />
                        </>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="Estigrade"
            subtitle="enhance grades when students accurately estimate their exam scores"
            sections={sections}
            settings={settings}
        />
    );
}
