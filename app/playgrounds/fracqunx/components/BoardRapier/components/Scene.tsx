import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useCallback,
    useEffect,
} from 'react';

import {
    OrthographicCamera,
    OrbitControls,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import {
    PegData,
    BeadData,

    pegColor,
    wallColor,

    pegRadius,
} from '../data';

import Container from './Container';
import Pegs from './Pegs';
import Beads from './Beads';
import DrawingCanvas from './DrawingCanvas';
import {
    GaussianCurve,
} from './Extras';

import { AdaptiveStressSystem } from './StressSharingSystem';



export interface SceneRef {
    reset: () => void;
}

export interface SceneProps {
    pegs: PegData[];
    beads: BeadData[];
    setSelectedPeg: (index: number | null) => void;
    setPegs: (pegs: PegData[]) => void;
    areaOfEffect: boolean;
    morphodynamics: boolean;
    customCurve: THREE.CatmullRomCurve3 | null;
    setCustomCurve: (curve: THREE.CatmullRomCurve3 | null) => void;
    drawingCurve: boolean;
    setDrawingCurve: (drawing: boolean) => void;
}

const Scene = forwardRef<SceneRef, SceneProps>(function SceneFn({
    pegs,
    beads,
    setSelectedPeg,
    setPegs,
    areaOfEffect,
    morphodynamics,
    customCurve,
    setCustomCurve,
    drawingCurve,
    setDrawingCurve,
}, ref) {
    const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

    const stressSystem = useRef<AdaptiveStressSystem | null>(null);


    useEffect(() => {
        if (morphodynamics) {
            stressSystem.current = new AdaptiveStressSystem(pegs, customCurve);
        } else {
            stressSystem.current = null;
        }
    }, [morphodynamics, customCurve, pegs]);

    useFrame(() => {
        if (morphodynamics && stressSystem.current) {
            const updatedPegs = stressSystem.current.updatePegProperties(beads);
            setPegs(updatedPegs);
        }
    });

    useEffect(() => {
        if (stressSystem.current) {
            stressSystem.current.setTargetCurve(customCurve);
        }
    }, [customCurve]);


    const reset = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    }, []);

    useImperativeHandle(ref, () => {
        return {
            reset,
        }
    }, [
        reset,
    ]);


    return (
        <>
            <ambientLight intensity={1} />
            <directionalLight
                position={[-10, 10, 0]}
                intensity={1.5}
                castShadow
            />

            <OrthographicCamera
                makeDefault
                position={[0, 0, 10]}
                zoom={80}
                near={0.1}
                far={1000}
            />
            <OrbitControls
                ref={controlsRef}
                enabled={!drawingCurve}
            />

            <group
                position={[0, -2, 0]}
            >
                <Container />
                <Pegs
                    pegs={pegs}
                    pegRadius={pegRadius}
                    pegColor={pegColor}
                    shape="cylinder"
                    clickable={areaOfEffect}
                    onPegClick={(index) => {
                        if (!areaOfEffect) {
                            return;
                        }

                        setSelectedPeg(index);
                    }}
                />
                {!morphodynamics && (
                    <GaussianCurve />
                )}
                <Beads
                    beads={beads}
                    pegs={pegs}
                />

                {morphodynamics && (
                    <>
                        <DrawingCanvas
                            width={3.6} height={2} position={[0, -1.2, 0.1]}
                            onCurveCreated={(curve) => {
                                setCustomCurve(curve);
                            }}
                            drawingCurve={drawingCurve}
                            setDrawingCurve={setDrawingCurve}
                        />

                        {customCurve && (
                            <mesh position={[0, -1.2, -0.15]}>
                                <tubeGeometry
                                    args={[
                                        customCurve,
                                        64,    // tubular segments
                                        0.01,  // radius
                                        8,     // radial segments
                                        false  // closed
                                    ]}
                                />
                                <meshStandardMaterial color={wallColor} />
                            </mesh>
                        )}
                    </>
                )}
            </group>
        </>
    );
});


export default Scene;
