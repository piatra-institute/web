'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer, { ViewerRef } from './components/Viewer';
import {
    KnotSpec,
    Vec3,
    torusKnotPoints,
    connectedSumApprox,
    centerAndScale,
    smoothAndRepel,
    computeDiagnostics,
    crossingSummaryFromProjection,
} from './logic/knot';


// Default values
const defaults = {
    knotA: { p: 2, q: 7, mirror: false, R: 2.25, r: 0.85 } as KnotSpec,
    knotB: { p: 2, q: 7, mirror: true, R: 2.25, r: 0.85 } as KnotSpec,
    mode: 'SUM' as 'A' | 'B' | 'SUM',
    samples: 1200,
    sumFlipB: false,
    tightenIters: 0,
    tightenStiffness: 0.07,
    tightenRepel: 0.0015,
    rx: 0.2,
    ry: 0.6,
    rz: 0,
    zoom: 3.5,
    ropeThickness: 6,
};


export default function UnknotStudioPlayground() {
    const viewerRef = useRef<ViewerRef>(null);

    // Knot specs
    const [knotA, setKnotA] = useState<KnotSpec>(defaults.knotA);
    const [knotB, setKnotB] = useState<KnotSpec>(defaults.knotB);

    // View mode
    const [mode, setMode] = useState<'A' | 'B' | 'SUM'>(defaults.mode);

    // Geometry
    const [samples, setSamples] = useState(defaults.samples);

    // Connected sum options
    const [sumFlipB, setSumFlipB] = useState(defaults.sumFlipB);

    // Tighten
    const [tightenIters, setTightenIters] = useState(defaults.tightenIters);
    const [tightenStiffness, setTightenStiffness] = useState(defaults.tightenStiffness);
    const [tightenRepel, setTightenRepel] = useState(defaults.tightenRepel);

    // Rotation
    const [rx, setRx] = useState(defaults.rx);
    const [ry, setRy] = useState(defaults.ry);
    const [rz, setRz] = useState(defaults.rz);
    const [zoom, setZoom] = useState(defaults.zoom);

    // Rope thickness
    const [ropeThickness, setRopeThickness] = useState(defaults.ropeThickness);

    // Projection search
    const [bestCross, setBestCross] = useState<{
        count: number;
        rx: number;
        ry: number;
        rz: number;
    } | null>(null);

    // Compute base curves
    const baseA = useMemo(() => torusKnotPoints(knotA, samples), [knotA, samples]);
    const baseB = useMemo(() => torusKnotPoints(knotB, samples), [knotB, samples]);

    // Compute displayed curve
    const curve = useMemo(() => {
        let pts: Vec3[];
        if (mode === 'A') pts = baseA;
        else if (mode === 'B') pts = baseB;
        else pts = connectedSumApprox(baseA, baseB, { flipB: sumFlipB });

        pts = centerAndScale(pts, 1.0);

        if (tightenIters > 0) {
            pts = smoothAndRepel(pts, tightenIters, tightenStiffness, tightenRepel);
        }

        return pts;
    }, [mode, baseA, baseB, sumFlipB, tightenIters, tightenStiffness, tightenRepel]);

    // Compute diagnostics
    const diagnostics = useMemo(
        () => computeDiagnostics(curve, rx, ry, rz),
        [curve, rx, ry, rz]
    );

    // Callbacks
    const handleRotationChange = useCallback((newRx: number, newRy: number, newRz: number) => {
        setRx(newRx);
        setRy(newRy);
        setRz(newRz);
    }, []);

    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    const handleTightenChange = useCallback((iters: number, stiffness: number, repel: number) => {
        setTightenIters(iters);
        setTightenStiffness(stiffness);
        setTightenRepel(repel);
    }, []);

    const handleSearchRotations = useCallback(() => {
        let best = { count: Infinity, rx, ry, rz };
        for (let t = 0; t < 200; t++) {
            const trx = (Math.random() - 0.5) * Math.PI;
            const tryy = (Math.random() - 0.5) * Math.PI;
            const trz = (Math.random() - 0.5) * Math.PI;
            const cs = crossingSummaryFromProjection(curve, trx, tryy, trz, 280);
            if (cs.count < best.count) {
                best = { count: cs.count, rx: trx, ry: tryy, rz: trz };
            }
        }
        setBestCross(best);
    }, [curve, rx, ry, rz]);

    const handleJumpToBest = useCallback(() => {
        if (bestCross) {
            setRx(bestCross.rx);
            setRy(bestCross.ry);
            setRz(bestCross.rz);
        }
    }, [bestCross]);

    const handleLoadBHCounterexample = useCallback(() => {
        setKnotA({ p: 2, q: 7, mirror: false, R: 2.25, r: 0.85 });
        setKnotB({ p: 2, q: 7, mirror: true, R: 2.25, r: 0.85 });
        setMode('SUM');
        setSumFlipB(false);
    }, []);

    const handleResetView = useCallback(() => {
        setRx(defaults.rx);
        setRy(defaults.ry);
        setRz(defaults.rz);
        setZoom(defaults.zoom);
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Interactive 3D visualization of torus knots and their connected sums
                    </p>
                    <p className="text-gray-400">
                        Explore knot geometry, compute projection-dependent invariants, and investigate
                        how different viewing angles affect crossing counts. Build connected sums{' '}
                        <Equation math="K_1 \# K_2" /> and examine their properties.
                    </p>
                </div>
            ),
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer
                    controls={
                        <div className="flex gap-2">
                            <Button
                                label="Reset view"
                                onClick={handleResetView}
                                size="sm"
                            />
                        </div>
                    }
                >
                    <Viewer
                        ref={viewerRef}
                        curve={curve}
                        diagnostics={diagnostics}
                        mode={mode}
                        knotA={knotA}
                        knotB={knotB}
                        rx={rx}
                        ry={ry}
                        rz={rz}
                        zoom={zoom}
                        ropeThickness={ropeThickness}
                        onRotationChange={handleRotationChange}
                        onZoomChange={handleZoomChange}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Torus Knots</h4>
                        <p className="text-gray-300">
                            A torus knot <Equation math="T(p,q)" /> winds <Equation math="p" /> times
                            around the longitude and <Equation math="q" /> times around the meridian
                            of a torus. When <Equation math="\gcd(p,q) = 1" />, this produces a knot;
                            otherwise it is a link. The crossing number is{' '}
                            <Equation math="\min((p-1)q, (q-1)p)" /> and the unknotting number is{' '}
                            <Equation math="u(T(p,q)) = \frac{(p-1)(q-1)}{2}" />.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Connected Sum</h4>
                        <p className="text-gray-300">
                            The connected sum <Equation math="K_1 \# K_2" /> is formed by cutting both
                            knots and joining their ends. This playground approximates the sum by
                            placing two knots side-by-side and connecting them with smooth bezier bridges.
                            The inequality <Equation math="u(K_1 \# K_2) \leq u(K_1) + u(K_2)" /> always
                            holds since you can unknot each summand separately.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Projection Invariants</h4>
                        <p className="text-gray-300">
                            The crossing count and writhe shown depend on the current viewing angle.
                            Rotating the knot changes these values. The minimum crossing number over
                            all projections is a knot invariant, but finding it is computationally hard.
                            Use the projection search to sample random rotations and find lower crossing counts.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Ropelength</h4>
                        <p className="text-gray-300">
                            Ropelength is the ratio of curve length to thickness (the diameter of the
                            largest tube that fits around the curve without self-intersection). It measures
                            how much rope is needed to tie the knot. The tighten function applies
                            smoothing and repulsion to approximate a ropelength-minimizing configuration.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The 2025 Counterexample</h4>
                        <p className="text-gray-300">
                            Brittenham and Hermiller (2025) disproved the conjecture that unknotting
                            numbers are additive. For <Equation math="K = T(2,7)" /> with{' '}
                            <Equation math="u(K) = 3" />, they showed{' '}
                            <Equation math="u(K \# \overline{K}) \leq 5 < 6" />. Load this example
                            from the settings panel to explore it. The key insight: optimal unknotting
                            may require moving to a more complex diagram before making crossing changes.
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            knotA={knotA}
            knotB={knotB}
            onKnotAChange={setKnotA}
            onKnotBChange={setKnotB}
            mode={mode}
            onModeChange={setMode}
            samples={samples}
            onSamplesChange={setSamples}
            sumFlipB={sumFlipB}
            onSumFlipBChange={setSumFlipB}
            tightenIters={tightenIters}
            tightenStiffness={tightenStiffness}
            tightenRepel={tightenRepel}
            onTightenChange={handleTightenChange}
            rx={rx}
            ry={ry}
            rz={rz}
            onRotationChange={handleRotationChange}
            ropeThickness={ropeThickness}
            onRopeThicknessChange={setRopeThickness}
            zoom={zoom}
            onZoomChange={handleZoomChange}
            bestCross={bestCross}
            currentCrossings={diagnostics.crossing.count}
            onSearchRotations={handleSearchRotations}
            onJumpToBest={handleJumpToBest}
            onLoadBHCounterexample={handleLoadBHCounterexample}
            onResetView={handleResetView}
        />
    );

    return (
        <PlaygroundLayout
            title="Unknot Studio"
            subtitle="torus knots, connected sums, and projection invariants"
            sections={sections}
            settings={settings}
        />
    );
}
