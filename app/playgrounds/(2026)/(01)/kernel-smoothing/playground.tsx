'use client';

import { useState, useMemo } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';

import {
    type SimulationParams,
    type DataPoint,
    DEFAULT_PARAMS,
    DEFAULT_POINTS,
    computeDerivedData,
} from './logic';

export default function Playground() {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [points, setPoints] = useState<DataPoint[]>([...DEFAULT_POINTS]);

    const derived = useMemo(() => {
        return computeDerivedData(points, params);
    }, [points, params]);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <Viewer
                    params={params}
                    derivedPoints={derived.pts}
                    grid={derived.grid}
                    lo={derived.lo}
                    hi={derived.hi}
                    Z={derived.Z}
                    yHat={derived.yHat}
                />
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="space-y-8">
                    <h2 className="text-lime-400 text-xl font-semibold">
                        Attention as Kernel Smoothing
                    </h2>

                    <p className="text-gray-300">
                        The attention mechanism in Transformers is mathematically equivalent to
                        <strong className="text-lime-400"> Nadaraya-Watson kernel regression</strong>.
                        Both compute a weighted average where weights come from a similarity function.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-lime-500/30 p-4 space-y-3">
                            <h3 className="text-lime-400 font-semibold">Kernel Smoothing</h3>
                            <div className="text-sm text-gray-400 space-y-2">
                                <p>
                                    <Equation math="K(x_q, x_i)" /> = similarity-to-weight mapping
                                </p>
                                <p>
                                    <Equation math="\alpha_i = \frac{K(x_q, x_i)}{\sum_j K(x_q, x_j)}" />
                                </p>
                                <p>
                                    <Equation math="\hat{y}(x_q) = \sum_i \alpha_i y_i" />
                                </p>
                            </div>
                        </div>

                        <div className="border border-lime-500/30 p-4 space-y-3">
                            <h3 className="text-lime-400 font-semibold">Attention (scaled dot-product)</h3>
                            <div className="text-sm text-gray-400 space-y-2">
                                <p>
                                    <Equation math="\text{score}_i = \frac{q \cdot k_i}{\sqrt{d_k}}" />
                                </p>
                                <p>
                                    <Equation math="\alpha_i = \text{softmax}(\text{score})_i" />
                                </p>
                                <p>
                                    <Equation math="\text{out} = \sum_i \alpha_i v_i" />
                                </p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lime-400 font-semibold mt-8">Component Mapping</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-lime-500/30">
                                    <th className="text-left py-2 text-lime-400">Transformer Attention</th>
                                    <th className="text-left py-2 text-lime-400">Kernel Regression</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-400">
                                <tr className="border-b border-lime-500/10">
                                    <td className="py-2">query <Equation math="q" /></td>
                                    <td className="py-2">evaluation point <Equation math="x_q" /></td>
                                </tr>
                                <tr className="border-b border-lime-500/10">
                                    <td className="py-2">keys <Equation math="\{k_i\}" /></td>
                                    <td className="py-2">sample locations <Equation math="\{x_i\}" /></td>
                                </tr>
                                <tr className="border-b border-lime-500/10">
                                    <td className="py-2">values <Equation math="\{v_i\}" /></td>
                                    <td className="py-2">sample responses <Equation math="\{y_i\}" /></td>
                                </tr>
                                <tr className="border-b border-lime-500/10">
                                    <td className="py-2">score <Equation math="q \cdot k_i / \sqrt{d_k}" /></td>
                                    <td className="py-2">similarity / negative distance</td>
                                </tr>
                                <tr className="border-b border-lime-500/10">
                                    <td className="py-2">softmax weights <Equation math="\alpha_i" /></td>
                                    <td className="py-2">normalized kernel weights</td>
                                </tr>
                                <tr>
                                    <td className="py-2">output <Equation math="\sum_i \alpha_i v_i" /></td>
                                    <td className="py-2">locally weighted average</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lime-400 font-semibold mt-8">Key Insights</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-400">
                        <li>
                            <strong className="text-lime-200">Learned kernel:</strong> In Transformers,
                            the projections <Equation math="q = xW_Q" />, <Equation math="k = xW_K" />, <Equation math="v = xW_V" /> are
                            learned, so the model learns the similarity geometry.
                        </li>
                        <li>
                            <strong className="text-lime-200">Multiple heads:</strong> Multi-head attention
                            uses multiple learned kernels in parallel.
                        </li>
                        <li>
                            <strong className="text-lime-200">Bandwidth vs temperature:</strong> The Gaussian
                            bandwidth <Equation math="h" /> controls locality; the softmax temperature <Equation math="\tau" /> (or <Equation math="\sqrt{d_k}" />) controls
                            how peaky the weights become.
                        </li>
                        <li>
                            <strong className="text-lime-200">Efficient attention:</strong> Because softmax
                            attention is a kernel operation, methods like Performer approximate it with
                            random feature maps for linear complexity.
                        </li>
                    </ul>

                    <h3 className="text-lime-400 font-semibold mt-8">What to Try</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-400">
                        <li>Set <Equation math="h" /> small (e.g., 0.2) and move <Equation math="x_q" />: weights become very local.</li>
                        <li>Set <Equation math="\tau" /> small in Softmax-dot: weights become peaky (attention focuses on few keys).</li>
                        <li>Change <Equation math="x_i" /> positions to cluster points: observe how <Equation math="\alpha" /> redistributes.</li>
                        <li>Compare Gaussian vs Softmax-dot: note how softmax-dot prefers points with same sign as <Equation math="x_q" />.</li>
                    </ul>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="kernel smoothing"
            subtitle="Attention is a reinvention of kernel smoothing"
            description={
                <a
                    href="https://en.wikipedia.org/wiki/Kernel_regression"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-lime-400"
                >
                    Nadaraya-Watson kernel regression
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    points={points}
                    onPointsChange={setPoints}
                    derivedPoints={derived.pts}
                    Z={derived.Z}
                    yHat={derived.yHat}
                />
            }
        />
    );
}
