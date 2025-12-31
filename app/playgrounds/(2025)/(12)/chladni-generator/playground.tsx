'use client';

import { useRef } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import Equation from '@/components/Equation';
import { ShapeType } from './logic';

export interface ViewerRef {
    updateSimulation: (params: SimulationParams) => void;
    reset: () => void;
}

export interface SimulationParams {
    shape: ShapeType;
    ringInner: number;
    resolution: number;
    running: boolean;
    // Mode 1
    m1: number;
    n1: number;
    a1: number;
    symmetric1: boolean;
    // Mode 2
    m2: number;
    n2: number;
    a2: number;
    symmetric2: boolean;
    useSecondMode: boolean;
    // Sand
    sandRate: number;
    sandDiff: number;
    showSand: boolean;
    // Display
    nodeThreshold: number;
    showNodes: boolean;
    invert: boolean;
    contrast: number;
}

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);

    const handleParamsChange = (params: SimulationParams) => {
        viewerRef.current?.updateSimulation(params);
    };

    const handleReset = () => {
        viewerRef.current?.reset();
    };

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="w-full h-full">
                    <Viewer ref={viewerRef} />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Chladni Patterns</h4>
                        <p className="text-gray-300">
                            Ernst Chladni (1756-1827) discovered that fine particles on a vibrating plate
                            accumulate along <em>nodal lines</em>—curves where the plate remains stationary.
                            These patterns reveal the plate&apos;s eigenmodes: the natural frequencies at which
                            it resonates.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The Chladni Equation</h4>
                        <p className="text-gray-300 mb-3">
                            For a rectangular plate with free edges, the displacement pattern takes the form:
                        </p>
                        <Equation mode="block" math="z(x,y) = \cos(m\pi x)\cos(n\pi y) \pm \cos(n\pi x)\cos(m\pi y)" />
                        <p className="text-gray-300 mt-3">
                            The mode numbers <Equation math="(m,n)" /> count half-wavelengths in each direction.
                            The <Equation math="+" /> gives symmetric modes; <Equation math="-" /> gives
                            antisymmetric modes with different nodal geometries.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Nodal Lines</h4>
                        <p className="text-gray-300">
                            Nodal lines appear where <Equation math="z = 0" />. Along these curves, the plate
                            does not vibrate, so particles accumulate there. The pattern of nodal lines uniquely
                            identifies each eigenmode. Higher mode numbers produce more complex nodal networks.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Mode Superposition</h4>
                        <p className="text-gray-300">
                            Real vibrations often excite multiple modes simultaneously. When two modes are
                            superposed, the resulting nodal pattern is the intersection of regions where
                            the combined amplitude is small. This creates more intricate patterns than
                            single modes alone.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Eigenfrequencies</h4>
                        <p className="text-gray-300 mb-3">
                            Each mode <Equation math="(m,n)" /> has a characteristic eigenfrequency:
                        </p>
                        <Equation mode="block" math="\omega_{mn} \propto \sqrt{\left(\frac{m}{L}\right)^2 + \left(\frac{n}{W}\right)^2}" />
                        <p className="text-gray-300 mt-3">
                            where <Equation math="L" /> and <Equation math="W" /> are the plate dimensions.
                            When the driving frequency matches an eigenfrequency, that mode resonates strongly.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Boundary Geometry</h4>
                        <p className="text-gray-300">
                            The plate&apos;s shape constrains which modes can exist. Square plates support modes
                            with independent horizontal and vertical structure. Circular plates favor radial
                            and angular modes. Ring (annular) plates eliminate the center, changing which
                            patterns are possible. Each boundary geometry acts as a spatial filter on the
                            spectrum of available eigenmodes.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Sand Dynamics</h4>
                        <p className="text-gray-300">
                            The simulation models sand particle migration using a gradient descent approach:
                            particles flow from regions of high vibration amplitude to low amplitude regions.
                            Diffusion spreads particles locally, while the migration term drives them toward
                            nodal lines. The steady state reveals the eigenmode&apos;s nodal structure.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Historical Context</h4>
                        <p className="text-gray-300">
                            Chladni demonstrated these patterns to Napoleon in 1809, who was so impressed
                            that he offered a prize for a mathematical theory explaining them. Sophie Germain
                            eventually won the prize in 1816 with her work on the vibrations of elastic surfaces,
                            contributing to the development of the biharmonic equation in elasticity theory.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Chladni generator"
            subtitle="standing wave patterns on vibrating plates"
            description="visualizing eigenmodes through nodal line formation"
            sections={sections}
            settings={<Settings onParamsChange={handleParamsChange} onReset={handleReset} />}
        />
    );
}
