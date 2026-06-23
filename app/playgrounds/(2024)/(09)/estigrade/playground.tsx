'use client';

import { useState, useMemo } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel from '@/components/CalibrationPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { computeFinalGrade } from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


export default function EstigradePlayground() {
    const [reward, setReward] = useState(0.1);
    const [penalty, setPenalty] = useState(0.2);
    const [estimatedGrade, setEstimatedGrade] = useState(80);
    const [examGrade, setExamGrade] = useState(80);

    const finalGrade = useMemo(
        () => computeFinalGrade({ estimatedGrade, examGrade, reward, penalty }),
        [estimatedGrade, examGrade, reward, penalty],
    );
    const calibration = useMemo(() => buildCalibration(), []);

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
                    <Viewer finalGrade={finalGrade} />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Grading the estimate, not just the exam</h3>
                        <p className="leading-relaxed text-sm">
                            Estigrade is an experimental grading rule designed to develop students&apos; metacognitive
                            skills by rewarding accurate self-assessment. Before an exam, a student estimates their
                            expected score, and the final grade is adjusted by how close that prediction turned out to be.
                        </p>
                        <p className="leading-relaxed text-sm mt-3">
                            The formula balances two terms: a reward for a close estimate and a penalty for a far one.
                            Predict your performance well and you gain bonus points; miss badly and points are deducted.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <p className="text-lime-200/80 text-sm">
                            The idea is to make self-knowledge a graded skill, so students build realistic self-assessment
                            that carries beyond the classroom. Whether it actually improves learning, and whether honest
                            estimation is even the score-maximizing strategy, are open questions the assumptions panel keeps
                            separate from the formula itself.
                        </p>
                    </div>

                    <div className="border-t border-lime-500/20 pt-6">
                        <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="final grade" />

                    <AssumptionPanel assumptions={assumptions} />

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="estigrade"
            subtitle="enhance grades when students accurately estimate their exam scores"
            sections={sections}
            settings={
                <Settings
                    estimatedGrade={estimatedGrade}
                    setEstimatedGrade={setEstimatedGrade}
                    examGrade={examGrade}
                    setExamGrade={setExamGrade}
                    reward={reward}
                    setReward={setReward}
                    penalty={penalty}
                    setPenalty={setPenalty}
                />
            }
            researchUrl="/playgrounds/estigrade/research"
        />
    );
}
