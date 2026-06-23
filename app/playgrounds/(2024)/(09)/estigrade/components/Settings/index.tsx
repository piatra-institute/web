'use client';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import Input from '@/components/Input';


interface SettingsProps {
    estimatedGrade: number;
    setEstimatedGrade: (n: number) => void;
    examGrade: number;
    setExamGrade: (n: number) => void;
    reward: number;
    setReward: (n: number) => void;
    penalty: number;
    setPenalty: (n: number) => void;
}

const clampInt = (raw: string, max: number): number => {
    const v = parseInt(raw);
    if (isNaN(v) || v < 0) return 0;
    return v > max ? max : v;
};

const clampFloat = (raw: string, max: number): number => {
    const v = parseFloat(raw);
    if (isNaN(v) || v < 0) return 0;
    return v > max ? max : v;
};


export default function Settings({
    estimatedGrade,
    setEstimatedGrade,
    examGrade,
    setExamGrade,
    reward,
    setReward,
    penalty,
    setPenalty,
}: SettingsProps) {
    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Grade Estimation Parameters',
                    content: (
                        <>
                            <Input
                                value={estimatedGrade}
                                onChange={(e) => setEstimatedGrade(clampInt(e, 100))}
                                label="Estimated Grade"
                                compact={true}
                                type="number"
                                min={0}
                                max={100}
                                inputMode="numeric"
                            />
                            <Input
                                value={examGrade}
                                onChange={(e) => setExamGrade(clampInt(e, 100))}
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
                                onChange={(e) => setReward(clampFloat(e, 1))}
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
                                onChange={(e) => setPenalty(clampFloat(e, 1))}
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
}
