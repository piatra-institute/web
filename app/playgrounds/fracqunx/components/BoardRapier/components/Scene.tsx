import React from 'react';

import {
    OrthographicCamera, OrbitControls,
} from '@react-three/drei';

import {
    PegData,
    BeadData,

    pegColor,

    pegRadius,
} from '../data';

import Pegs from './Pegs';
import Beads from './Beads';
import Container from './Container';
import {
    GaussianCurve,
} from './Extras';



function Scene({
    pegs,
    beads,
    setSelectedPeg,
    areaOfEffect,
}: {
    pegs: PegData[];
    beads: BeadData[];
    setSelectedPeg: (index: number | null) => void;
    areaOfEffect: boolean;
}) {
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
            <OrbitControls />

            <group position={[0, -2, 0]}>
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
                <GaussianCurve />
                <Beads
                    beads={beads}
                    pegs={pegs}
                />
            </group>
        </>
    );
}


export default Scene;
