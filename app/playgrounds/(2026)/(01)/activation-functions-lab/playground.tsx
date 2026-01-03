'use client';

import { useRef, useState, useCallback } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer, { ViewerRef } from './components/Viewer';
import Equation from '@/components/Equation';
import { Spec, BuiltinType, defaultSpec, uid, BUILTINS } from './logic';

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);

    // Current spec being edited
    const [spec, setSpec] = useState<Spec>(() => ({ ...defaultSpec(), name: 'GELU' }));

    // Saved candidates
    const [savedCandidates, setSavedCandidates] = useState<Spec[]>([]);

    // Active overlay IDs
    const [activeOverlayIds, setActiveOverlayIds] = useState<string[]>([]);

    // Plot settings
    const [showDerivative, setShowDerivative] = useState(true);
    const [xMin, setXMin] = useState(-6);
    const [xMax, setXMax] = useState(6);
    const [samples, setSamples] = useState(401);
    const [invertChart, setInvertChart] = useState(false);

    const handleSaveCandidate = useCallback(() => {
        const saved = { ...spec, id: uid() };
        setSavedCandidates((prev) => [saved, ...prev]);
    }, [spec]);

    const handleLoadCandidate = useCallback((candidate: Spec) => {
        setSpec({ ...candidate, id: uid() });
    }, []);

    const handleRemoveCandidate = useCallback((id: string) => {
        setSavedCandidates((prev) => prev.filter((c) => c.id !== id));
        setActiveOverlayIds((prev) => prev.filter((oid) => oid !== id));
    }, []);

    const handleToggleOverlay = useCallback((id: string) => {
        setActiveOverlayIds((prev) =>
            prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id].slice(0, 3)
        );
    }, []);

    const handleReset = useCallback(() => {
        setActiveOverlayIds([]);
    }, []);

    const handleSelectActivation = useCallback((name: string) => {
        if (BUILTINS.includes(name as BuiltinType)) {
            setSpec((prev) => ({
                ...prev,
                id: uid(),
                name,
                kind: 'builtin',
                builtinType: name as BuiltinType,
            }));
        }
    }, []);

    // Get overlays to display
    const overlays = savedCandidates.filter((c) => activeOverlayIds.includes(c.id));

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="w-full h-full flex items-center justify-center">
                    <Viewer
                        ref={viewerRef}
                        spec={spec}
                        overlays={overlays}
                        showDerivative={showDerivative}
                        xMin={xMin}
                        xMax={xMax}
                        samples={samples}
                        invertChart={invertChart}
                        onSelectActivation={handleSelectActivation}
                    />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Activation Functions</h4>
                        <p className="text-gray-300">
                            Activation functions introduce non-linearity into neural networks,
                            enabling them to learn complex patterns. The choice of activation
                            function affects gradient flow, training dynamics, and model expressivity.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">ReLU and Its Variants</h4>
                        <p className="text-gray-300 mb-3">
                            The Rectified Linear Unit (ReLU) is the most widely used activation:
                        </p>
                        <Equation mode="block" math="\text{ReLU}(x) = \max(0, x)" />
                        <p className="text-gray-300 mt-3">
                            Leaky ReLU and PReLU address the &quot;dying ReLU&quot; problem by allowing
                            small gradients when <Equation math="x < 0" />:
                        </p>
                        <Equation mode="block" math="\text{LeakyReLU}(x) = \max(0, x) + \alpha \min(0, x)" />
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Smooth Activations</h4>
                        <p className="text-gray-300 mb-3">
                            GELU (Gaussian Error Linear Unit) provides a smooth approximation:
                        </p>
                        <Equation mode="block" math="\text{GELU}(x) \approx 0.5x\left(1 + \tanh\left(\sqrt{\frac{2}{\pi}}(x + 0.044715x^3)\right)\right)" />
                        <p className="text-gray-300 mt-3 mb-3">
                            Swish uses self-gating with a learnable parameter:
                        </p>
                        <Equation mode="block" math="\text{Swish}(x) = x \cdot \sigma(\beta x)" />
                        <p className="text-gray-300 mt-3 mb-3">
                            Mish combines Swish-like self-gating with softplus:
                        </p>
                        <Equation mode="block" math="\text{Mish}(x) = x \cdot \tanh(\text{softplus}(x))" />
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Composer Mode</h4>
                        <p className="text-gray-300">
                            The Composer mode lets you combine a base activation with a multiplicative
                            gate function. Common gate types include sigmoid, hard sigmoid, tanh, and
                            step functions. This pattern appears in Gated Linear Units (GLU) and
                            variants like SwiGLU used in modern transformers.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Expression Mode</h4>
                        <p className="text-gray-300">
                            Write custom activation functions using mathematical expressions. Supported
                            operations include arithmetic, power, and common functions like sigmoid,
                            tanh, relu, gelu, swish, mish, softplus, and more. Use <code className="text-lime-400">x</code> as
                            the input variable.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Diagnostics</h4>
                        <p className="text-gray-300">
                            The playground computes several heuristics to help evaluate activation
                            functions: maximum absolute output and derivative (Lipschitz estimate),
                            monotonicity, dead fraction (regions with near-zero gradient), and
                            symmetry scores (oddness/evenness). These help identify potential issues
                            like vanishing gradients or saturating regions.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Related Literature</h4>
                        <p className="text-gray-300">
                            PReLU (He et al. 2015) introduced learnable negative slopes. Swish
                            (Ramachandran et al. 2017) popularized self-gated activations. GELU
                            (Hendrycks &amp; Gimpel 2016) is now standard in transformers. Gated
                            architectures appear in GLU (Dauphin et al. 2017) and SwiGLU (Shazeer 2020).
                            The expression parser enables exploring the full design space of
                            differentiable activation functions.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="activation functions lab"
            subtitle="invent, explore, and compare neural network activations"
            sections={sections}
            settings={
                <Settings
                    spec={spec}
                    onSpecChange={setSpec}
                    onSaveCandidate={handleSaveCandidate}
                    onLoadCandidate={handleLoadCandidate}
                    onReset={handleReset}
                    savedCandidates={savedCandidates}
                    onRemoveCandidate={handleRemoveCandidate}
                    onToggleOverlay={handleToggleOverlay}
                    activeOverlayIds={activeOverlayIds}
                    showDerivative={showDerivative}
                    onToggleDerivative={() => setShowDerivative((prev) => !prev)}
                    xMin={xMin}
                    xMax={xMax}
                    samples={samples}
                    onXMinChange={setXMin}
                    onXMaxChange={setXMax}
                    onSamplesChange={setSamples}
                    invertChart={invertChart}
                    onToggleInvertChart={() => setInvertChart((prev) => !prev)}
                />
            }
        />
    );
}
