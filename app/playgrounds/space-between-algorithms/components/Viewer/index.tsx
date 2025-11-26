'use client';

import { forwardRef, useImperativeHandle, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SimulationParams, PRESETS, computeFreedomScore } from '../../constants';

interface BranchSegment {
    start: [number, number, number];
    end: [number, number, number];
    depth: number;
}

// Define the computation tree structure
// Trunk at depth 0, branches at depth 1 and 2
const BRANCH_SEGMENTS: BranchSegment[] = [
    // Trunk
    { start: [0, 0, 0], end: [0, 1.4, 0], depth: 0 },

    // Level 1 branches (4 directions)
    { start: [0, 1.4, 0], end: [0.6, 2.1, 0], depth: 1 },
    { start: [0, 1.4, 0], end: [-0.6, 2.1, 0], depth: 1 },
    { start: [0, 1.4, 0], end: [0, 2.1, 0.6], depth: 1 },
    { start: [0, 1.4, 0], end: [0, 2.1, -0.6], depth: 1 },

    // Level 2 branches from each level 1 branch
    { start: [0.6, 2.1, 0], end: [1.0, 2.6, 0.3], depth: 2 },
    { start: [0.6, 2.1, 0], end: [1.0, 2.6, -0.3], depth: 2 },

    { start: [-0.6, 2.1, 0], end: [-1.0, 2.6, 0.3], depth: 2 },
    { start: [-0.6, 2.1, 0], end: [-1.0, 2.6, -0.3], depth: 2 },

    { start: [0, 2.1, 0.6], end: [0.3, 2.6, 1.0], depth: 2 },
    { start: [0, 2.1, 0.6], end: [-0.3, 2.6, 1.0], depth: 2 },

    { start: [0, 2.1, -0.6], end: [0.3, 2.6, -1.0], depth: 2 },
    { start: [0, 2.1, -0.6], end: [-0.3, 2.6, -1.0], depth: 2 },
];

interface BranchMeshProps {
    segment: BranchSegment;
    slackFactor: number;
}

function BranchMesh({ segment, slackFactor }: BranchMeshProps) {
    const { start, end, depth } = segment;

    const geometry = useMemo(() => {
        const s = new THREE.Vector3(...start);
        const e = new THREE.Vector3(...end);
        const dir = new THREE.Vector3().subVectors(e, s);
        const length = dir.length();
        const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);

        // Create orientation matrix
        const orientation = new THREE.Matrix4();
        orientation.lookAt(s, e, new THREE.Vector3(0, 1, 0));
        orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

        return { length, mid, orientation };
    }, [start, end]);

    // Branch radius increases slightly with depth
    const dNorm = depth / 2.5;
    const branchRadius = 0.03 + 0.02 * dNorm;

    // Cloth (sheath) radius depends on slack factor and depth
    // More slack = thicker cloth, especially at outer branches
    const baseSheath = 0.06;
    const clothRadius = branchRadius + baseSheath + slackFactor * (0.15 + 0.3 * dNorm);

    const euler = useMemo(() => {
        return new THREE.Euler().setFromRotationMatrix(geometry.orientation);
    }, [geometry.orientation]);

    return (
        <group position={[geometry.mid.x, geometry.mid.y, geometry.mid.z]} rotation={euler}>
            {/* Core branch (dark cylinder) */}
            <mesh>
                <cylinderGeometry args={[branchRadius, branchRadius, geometry.length, 12]} />
                <meshStandardMaterial
                    color="#1a2e05"
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Cloth/sheath (translucent cylinder around branch) */}
            <mesh>
                <cylinderGeometry args={[clothRadius, clothRadius, geometry.length, 16]} />
                <meshStandardMaterial
                    color="#84cc16"
                    transparent
                    opacity={0.25 + slackFactor * 0.15}
                    roughness={0.6}
                    metalness={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

interface TreeSceneProps {
    params: SimulationParams;
}

function TreeScene({ params }: TreeSceneProps) {
    // Compute slack factor from parameters that affect "cloth thickness"
    // Higher intra-entropy, empowerment, and policy volume = more slack
    const slackFactor = useMemo(() => {
        return (
            0.4 * params.intraEntropy +
            0.3 * params.empowerment +
            0.3 * params.policyVolume
        );
    }, [params.intraEntropy, params.empowerment, params.policyVolume]);

    const freedomScore = computeFreedomScore(params);

    return (
        <>
            <color attach="background" args={['#000000']} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[3, 4, 2]} intensity={0.8} />
            <directionalLight position={[-3, 3, -2]} intensity={0.4} />
            <pointLight position={[0, 3, 0]} intensity={0.3} color="#84cc16" />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[8, 8]} />
                <meshStandardMaterial color="#0a0a0a" />
            </mesh>

            {/* Tree structure */}
            <group position={[0, -0.6, 0]}>
                {BRANCH_SEGMENTS.map((seg, idx) => (
                    <BranchMesh
                        key={`branch-${idx}`}
                        segment={seg}
                        slackFactor={slackFactor}
                    />
                ))}

                {/* Leaves/endpoints at level 2 branches */}
                {BRANCH_SEGMENTS.filter(s => s.depth === 2).map((seg, idx) => {
                    const leafRadius = 0.08 + slackFactor * 0.12;
                    return (
                        <mesh key={`leaf-${idx}`} position={seg.end}>
                            <sphereGeometry args={[leafRadius, 16, 16]} />
                            <meshStandardMaterial
                                color="#84cc16"
                                transparent
                                opacity={0.4 + slackFactor * 0.3}
                                emissive="#84cc16"
                                emissiveIntensity={0.2 + slackFactor * 0.3}
                            />
                        </mesh>
                    );
                })}
            </group>

            {/* Freedom score indicator sphere at top */}
            <mesh position={[0, 2.8, 0]}>
                <sphereGeometry args={[0.15 + (freedomScore / 100) * 0.2, 24, 24]} />
                <meshStandardMaterial
                    color="#84cc16"
                    transparent
                    opacity={0.3 + (freedomScore / 100) * 0.4}
                    emissive="#84cc16"
                    emissiveIntensity={0.3 + (freedomScore / 100) * 0.5}
                />
            </mesh>

            <OrbitControls
                enablePan={false}
                minDistance={2.5}
                maxDistance={8}
                target={[0, 1.2, 0]}
            />
        </>
    );
}

export interface ViewerRef {
    updateSimulation: (params: SimulationParams) => void;
    reset: () => void;
}

interface ViewerProps {
    params: SimulationParams;
}

const Viewer = forwardRef<ViewerRef, ViewerProps>(({ params }, ref) => {
    useImperativeHandle(ref, () => ({
        updateSimulation: () => {
            // No-op since params come from props now
        },
        reset: () => {
            // No-op since params come from props now
        },
    }));

    const freedomScore = computeFreedomScore(params);

    // Compute 2D map coordinates for algorithm space visualization
    const mapPoint = useMemo(() => {
        const locality = 0.6 * params.descriptiveRegularity + 0.4 * params.causalEmergence;
        const richness =
            0.4 * params.intraEntropy +
            0.3 * params.empowerment +
            0.3 * params.policyVolume;
        return {
            x: Math.max(0, Math.min(1, locality)),
            y: Math.max(0, Math.min(1, richness)),
        };
    }, [params]);

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3D Tree Visualization */}
                <div className="bg-black border border-lime-500/20">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Computation Tree + Goal Slack</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Branch thickness represents slack—many micro-paths to same macro-outcome
                        </p>
                    </div>
                    <div className="h-80">
                        <Canvas camera={{ position: [3, 2, 4], fov: 40 }}>
                            <Suspense fallback={null}>
                                <TreeScene params={params} />
                            </Suspense>
                        </Canvas>
                    </div>
                </div>

                {/* Algorithm Space Map */}
                <div className="bg-black border border-lime-500/20">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Algorithm Space Map</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Position in locality-regularity vs policy-richness plane
                        </p>
                    </div>
                    <div className="p-4">
                        <svg viewBox="0 0 100 100" className="w-full h-64">
                            {/* Quadrant backgrounds */}
                            <rect x="0" y="50" width="50" height="50" fill="#0a0a0a" />
                            <rect x="50" y="50" width="50" height="50" fill="#0d1a05" />
                            <rect x="0" y="0" width="50" height="50" fill="#1a0505" />
                            <rect x="50" y="0" width="50" height="50" fill="#0a1a0a" />

                            {/* Grid lines */}
                            <line x1="50" y1="0" x2="50" y2="100" stroke="#84cc16" strokeOpacity="0.2" />
                            <line x1="0" y1="50" x2="100" y2="50" stroke="#84cc16" strokeOpacity="0.2" />
                            <line x1="0" y1="0" x2="100" y2="0" stroke="#84cc16" strokeOpacity="0.3" />
                            <line x1="0" y1="100" x2="100" y2="100" stroke="#84cc16" strokeOpacity="0.3" />
                            <line x1="0" y1="0" x2="0" y2="100" stroke="#84cc16" strokeOpacity="0.3" />
                            <line x1="100" y1="0" x2="100" y2="100" stroke="#84cc16" strokeOpacity="0.3" />

                            {/* Quadrant labels */}
                            <text x="25" y="80" fill="#666" fontSize="6" textAnchor="middle">Rigid/finite</text>
                            <text x="75" y="80" fill="#4a7c10" fontSize="6" textAnchor="middle">LOCAL, regular</text>
                            <text x="25" y="20" fill="#7c1010" fontSize="6" textAnchor="middle">Wild/unrealizable</text>
                            <text x="75" y="20" fill="#84cc16" fontSize="6" textAnchor="middle">High-agency</text>

                            {/* Axis labels */}
                            <text x="50" y="98" fill="#888" fontSize="5" textAnchor="middle">Locality & Regularity →</text>
                            <text x="3" y="50" fill="#888" fontSize="5" textAnchor="middle" transform="rotate(-90, 3, 50)">Policy Richness →</text>

                            {/* Preset points */}
                            {PRESETS.filter(p => p.id !== 'custom').map((preset) => {
                                const px = (0.6 * preset.params.descriptiveRegularity + 0.4 * preset.params.causalEmergence) * 100;
                                const py = 100 - (0.4 * preset.params.intraEntropy + 0.3 * preset.params.empowerment + 0.3 * preset.params.policyVolume) * 100;
                                return (
                                    <g key={preset.id}>
                                        <circle cx={px} cy={py} r="3" fill="#3b82f6" fillOpacity="0.6" />
                                        <text x={px} y={py - 5} fill="#3b82f6" fontSize="4" textAnchor="middle">
                                            {preset.name.split(' ')[0]}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Current point (highlighted) */}
                            <circle
                                cx={mapPoint.x * 100}
                                cy={100 - mapPoint.y * 100}
                                r="5"
                                fill="#84cc16"
                                stroke="#fff"
                                strokeWidth="1"
                            />
                        </svg>
                    </div>
                </div>

                {/* Parameter Profile Bars */}
                <div className="bg-black border border-lime-500/20 lg:col-span-2">
                    <div className="p-3 border-b border-lime-500/20">
                        <h3 className="text-lime-400 font-semibold text-sm">Parameter Profile</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {[
                            { key: 'intraEntropy', label: 'Intra-algorithm branching' },
                            { key: 'empowerment', label: 'Empowerment (control)' },
                            { key: 'policyVolume', label: 'Policy manifold volume' },
                            { key: 'causalEmergence', label: 'Causal emergence' },
                            { key: 'descriptiveRegularity', label: 'Descriptive regularity' },
                        ].map((item) => {
                            const value = params[item.key as keyof SimulationParams];
                            return (
                                <div key={item.key}>
                                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                                        <span>{item.label}</span>
                                        <span className="font-mono text-lime-400">{Math.round(value * 100)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-900 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-lime-600 to-lime-400"
                                            style={{ width: `${value * 100}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Freedom Score Summary */}
                <div className="bg-black border border-lime-500/20 lg:col-span-2">
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lime-400 font-semibold">Composite Freedom Score</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Weighted combination: 25% branching + 25% empowerment + 20% volume + 20% emergence + 10% regularity
                            </p>
                        </div>
                        <div className="text-4xl font-bold text-lime-400">
                            {freedomScore}
                            <span className="text-lg text-gray-500 ml-1">/ 100</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
