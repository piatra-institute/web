import React, {
    useRef,
    useCallback,
    useState,
    useEffect,
} from 'react';

import {
    Canvas,
} from '@react-three/fiber';
import {
    Physics,
} from '@react-three/rapier';

import * as THREE from 'three';

import Scene, {
    SceneRef,
} from './components/Scene';
import PegEditor from './components/PegEditor';
import Buttons from './components/Buttons';

import {
    PegData,
    BeadData,

    pegSpacing,
    pegsYStart,
} from './data';

import Settings from '../Settings';



const usePegs = ({
    areaOfEffect,
} : {
    areaOfEffect: boolean,
}) => {
    const [pegs, setPegs] = useState<PegData[]>([]);

    useEffect(() => {
        const pegs: PegData[] = [];
        const PEGS_ROWS = 10;
        for (let row = 0; row < PEGS_ROWS; row++) {
            const numPegsInRow = 11;
            for (let col = 0; col < numPegsInRow; col++) {
                const xoffset = row % 2 === 0 ? 0 : 0.15;
                const xadjustment = -0.05;
                const x = (col - (numPegsInRow - 1) / 2) * pegSpacing + xoffset + xadjustment;
                const y = pegsYStart + -row * pegSpacing - 2;

                const aoeActive = Math.random() < 0.03;
                const aoeOptions = areaOfEffect ? {
                    aoe: aoeActive,
                    aoeSize: aoeActive ? Math.random() * 0.1 + 0.3 : 0,
                    aoeSpeed: aoeActive ? (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1) : 0,
                } : {
                    aoe: false,
                    aoeSize: 0,
                    aoeSpeed: 0,
                };

                pegs.push({
                    x,
                    y,
                    ...aoeOptions,
                });
            }
        }

        setPegs(pegs);
    }, [
        areaOfEffect,
    ]);

    return {
        pegs,
        setPegs,
    };
}


function Board({
    toggleTitle,
} : {
    toggleTitle: () => void;
}) {
    const mounted = useRef(false);
    const sceneRef = useRef<SceneRef | null>(null);

    const [beads, setBeads] = useState<BeadData[]>([]);
    const [customCurve, setCustomCurve] = useState<THREE.CatmullRomCurve3 | null>(null);
    const [drawingCurve, setDrawingCurve] = useState(false);

    const [isRunning, setIsRunning] = useState(false);
    const [areaOfEffect, setAreaOfEffect] = useState(false);
    const [morphodynamics, setMorphodynamics] = useState(false);

    const [selectedPeg, setSelectedPeg] = useState<number | null>(null);

    const [maxBeads, setMaxBeads] = useState(1000);
    const [bounceFactor, setBounceFactor] = useState(0.5);


    const {
        pegs,
        setPegs,
    } = usePegs(
        {
            areaOfEffect,
        },
    );


    const spawnBead = () => {
        if (beads.length >= maxBeads) {
            return;
        }

        // const randomX = (Math.random() - 0.5) * 2
        const randomX = 0
        setBeads(prev => [...prev, {
            id: Date.now() + Math.random(),
            position: [randomX, 5, 0] as any,
        }]);
    }

    const addBeads = useCallback(() => {
        if (beads.length >= maxBeads) {
            return;
        }

        const triangleHeight = 2; // Height of triangle above flippers
        const triangleBase = 3; // Base width between flippers
        const density = 0.1; // Space between beads
        const flipperY = 3.7; // Y position of flippers

        const newBeads: BeadData[] = [];

        // Generate rows of beads that form a triangle
        for (let y = 0; y < triangleHeight; y += density) {
            // Calculate width of current row (wider at top, narrower at bottom)
            const rowWidth = triangleBase * (y / triangleHeight);
            const beadsInRow = Math.floor(rowWidth / density);

            // Generate beads for current row
            for (let i = 0; i < beadsInRow; i++) {
                const x = -rowWidth/2 + i * density + 0.07;
                const bead: BeadData = {
                    id: Date.now() + Math.random(),
                    position: [
                        x, // X position
                        flipperY + y, // Y position (starting from flipper height)
                        0 // Z position
                    ] as any,
                };
                newBeads.push(bead);
            }
        }

        setBeads(prev => [...prev, ...newBeads]);
    }, [
        beads,
        maxBeads,
    ]);

    const resetPegs = useCallback(() => {
        setPegs(pegs => pegs.map(peg => {
            return {
                ...peg,
                aoe: false,
                aoeSize: 0,
                aoeSpeed: 0,
            };
        }));
    }, [
        setPegs,
    ]);

    const reset = useCallback(() => {
        if (sceneRef.current) {
            sceneRef.current.reset();
        }

        setBeads([]);
        setAreaOfEffect(false);
        setMorphodynamics(false);
        setCustomCurve(null);
        resetPegs();
        setIsRunning(false);
        addBeads();
    }, [
        setBeads,
        setAreaOfEffect,
        setMorphodynamics,
        setCustomCurve,
        resetPegs,
        addBeads,
    ]);

    const modeReset = useCallback(() => {
        setBeads([]);
        setCustomCurve(null);
        resetPegs();
        setIsRunning(false);
    }, [
        setBeads,
        setCustomCurve,
        resetPegs,
    ]);

    const removeBeads = () => {
        setBeads([]);
    }


    useEffect(() => {
        if (mounted.current) return;
        mounted.current = true;

        addBeads();
    }, [
        addBeads,
    ]);

    useEffect(() => {
        if (areaOfEffect) {
            setMorphodynamics(false);
            setIsRunning(false);
        }
    }, [
        areaOfEffect,
    ]);

    useEffect(() => {
        if (morphodynamics) {
            setAreaOfEffect(false);
            modeReset();
            addBeads();
        } else {
            setTimeout(() => {
                resetPegs();
            }, 50);
        }
    }, [
        morphodynamics,
        modeReset,
        resetPegs,
        addBeads,
    ]);


    return (
        <div className="h-dvh w-full">
            <Canvas
                shadows="soft"
            >
                <Physics
                    gravity={[0, -9.81, 0]}
                    paused={!isRunning}
                >
                    <Scene
                        ref={sceneRef}
                        pegs={pegs}
                        beads={beads}
                        setSelectedPeg={setSelectedPeg}
                        setPegs={setPegs}
                        areaOfEffect={areaOfEffect}
                        morphodynamics={morphodynamics}
                        customCurve={customCurve}
                        setCustomCurve={setCustomCurve}
                        drawingCurve={drawingCurve}
                        setDrawingCurve={setDrawingCurve}
                        bounceFactor={bounceFactor}
                    />
                </Physics>
            </Canvas>

            <Buttons
                isRunning={isRunning}
                setIsRunning={setIsRunning}
                areaOfEffect={areaOfEffect}
                setAreaOfEffect={setAreaOfEffect}
                morphodynamics={morphodynamics}
                setMorphodynamics={setMorphodynamics}
                reset={reset}
                addBeads={addBeads}
                spawnBead={spawnBead}
                toggleTitle={toggleTitle}
            />

            {selectedPeg !== null && (
                <PegEditor
                    selectedPegIndex={selectedPeg}
                    onClose={() => setSelectedPeg(null)}
                    onUpdatePeg={(index, settings) => {
                        const newPegs = [...pegs];
                        newPegs[index] = {
                            ...newPegs[index],
                            ...settings,
                        };
                        setPegs(newPegs);
                    }}
                    initialAoeSize={pegs[selectedPeg].aoeSize}
                    initialAoeSpeed={pegs[selectedPeg].aoeSpeed}
                />
            )}

            <Settings
                maxBeads={maxBeads}
                setMaxBeads={setMaxBeads}
                bounceFactor={bounceFactor}
                setBounceFactor={setBounceFactor}
                removeBeads={removeBeads}
            />
        </div>
    );
}


export default Board;
