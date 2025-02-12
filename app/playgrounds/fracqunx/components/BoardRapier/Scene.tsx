import React, {
    useEffect,
    useState,
} from 'react';
import {
    RigidBody,
} from '@react-three/rapier';
import {
    OrthographicCamera, Box, OrbitControls,
} from '@react-three/drei';

import * as THREE from 'three';

import Pegs, {
    PegData,
} from './Pegs';



const wallColor = '#FFD700';
const beadColor = '#50C878';
const pegColor = '#FFD700';


const pegsYStart = 5;

const width = 10;
const height = 30;
const pegSpacing = 0.3;
const pegRadius = 0.08;

const opacity = 0.2;
const thickness = 0.16;

const BEAD_RADIUS = 0.04;


export interface Bead {
    id: number;
    position: THREE.Vector3;
}


function Container() {
    return (
        <>
            {/* Bottom */}
            <RigidBody type="fixed">
                <Box args={[4, 0.2, thickness * 3]} position={[0, -2.3, 0]}>
                    <meshStandardMaterial color={wallColor} />
                </Box>
            </RigidBody>

            {/* Top */}
            <RigidBody type="fixed">
                <Box args={[4, 0.2, thickness * 3]} position={[0, 5.9, 0]}>
                    <meshStandardMaterial color={wallColor} />
                </Box>
            </RigidBody>

            {/* Left Flipper */}
            <RigidBody type="fixed">
                <Box
                    args={[2, 0.2, thickness]} position={[-1.05, 4, 0]}
                    rotation={[0, 0, -Math.PI / 7]}
                >
                    <meshStandardMaterial color={wallColor} />
                </Box>
                <Box
                    args={[1.8, 0.2, thickness]} position={[-1.005, 3.556, 0]}
                >
                    <meshStandardMaterial color={wallColor} />
                </Box>
            </RigidBody>

            {/* Right Flipper */}
            <RigidBody type="fixed">
                <Box
                    args={[2, 0.2, thickness]} position={[1.05, 4, 0]}
                    rotation={[0, 0, Math.PI / 7]}
                >
                    <meshStandardMaterial color={wallColor} />
                </Box>
                <Box
                    args={[1.8, 0.2, thickness]} position={[1.005, 3.556, 0]}
                >
                    <meshStandardMaterial color={wallColor} />
                </Box>
            </RigidBody>

            {/* Walls */}
            <RigidBody type="fixed">
                {/* Left */}
                <Box args={[0.2, 8.2, thickness]} position={[-1.9, 1.7, 0]}>
                    <meshStandardMaterial
                        color={wallColor}
                    />
                </Box>

                {/* Right */}
                <Box args={[0.2, 8.2, thickness]} position={[1.9, 1.7, 0]}>
                    <meshStandardMaterial
                        color={wallColor}
                    />
                </Box>

                {Array.from({ length: 17 }).map((_, i) => (
                    <Box
                        key={i}
                        args={[0.02, 2, thickness]} position={[-1.6 + 0.2 * i, -1.2, 0]}
                    >
                        <meshStandardMaterial
                            color={wallColor}
                            emissive={wallColor}
                            emissiveIntensity={0.8}
                            transparent={false}
                        />
                    </Box>
                ))}

                {/* Back */}
                <Box args={[4, 8.2, 0.2]} position={[0, 1.7, -thickness - 0.02]}>
                    <meshStandardMaterial color={wallColor} transparent opacity={0}
                        side={THREE.DoubleSide}
                    />
                </Box>

                {/* Front */}
                <Box args={[4, 8.2, 0.2]} position={[0, 1.7, thickness + 0.02]}>
                    <meshStandardMaterial color={wallColor} transparent opacity={0}
                        side={THREE.DoubleSide}
                    />
                </Box>
            </RigidBody>
        </>
    );
}


function BeadMesh({
    position,
    radius = BEAD_RADIUS,
}: {
    position: THREE.Vector3,
    radius?: number,
}) {
    return (
        <RigidBody
            type="dynamic"
            position={position}
            colliders="ball"
            restitution={0.5}
            friction={0.1}
            linearDamping={0.2}
            angularDamping={0.2}
            mass={0.2}
        // onSleep={() => console.log('sleep')}
        >
            <mesh>
                <sphereGeometry args={[radius]} />
                <meshStandardMaterial
                    color={beadColor}
                    emissive={beadColor}
                />
            </mesh>
        </RigidBody>
    );
}


function Beads({
    beads,
} : {
    beads: Bead[],
}) {
    return (
        <>
            {beads.map((bead, index) => (
                <BeadMesh key={index + bead.id} position={bead.position} />
            ))}
        </>
    );
}


function GaussianCurve() {
    return (
        <mesh
            position={[0, -2.5, -0.15]}
        >
            <tubeGeometry
                args={[
                    new THREE.CatmullRomCurve3(
                        Array.from({ length: 50 }, (_, i) => {
                            const x = (i - 25) / 12.5;  // Range from -5 to 5
                            // Gaussian function: f(x) = a * e^(-(x-b)²/(2c²))
                            const y = 2.2 * Math.exp(-(x * x) / 1.6);  // a=2, b=0, c=1
                            return new THREE.Vector3(x, y, 0);
                        })
                    ),
                    64,     // tubular segments
                    0.01,    // radius
                    8,      // radial segments
                    false   // closed
                ]}
            />
            <meshStandardMaterial color={wallColor} />
        </mesh>
    );
}

const usePegs = () => {
    const [pegs, setPegs] = useState<PegData[]>([]);

    useEffect(() => {
        const pegs: PegData[] = [];
        const PEGS_ROWS = 10;
        for (let row = 0; row < PEGS_ROWS; row++) {
            const numPegsInRow = 11;
            for (let col = 0; col < numPegsInRow; col++) {
                const offset = row % 2 === 0 ? 0 : 0.15;
                const x = -0.05 + (col - (numPegsInRow - 1) / 2) * pegSpacing + offset;
                const y = pegsYStart + -row * pegSpacing - 2;
                pegs.push({
                    x,
                    y,
                    // aoe: false,
                    // aoeSize: 0,
                    // aoeSpeed: 0,
                    aoe: Math.random() < 0.03,
                    aoeSize: Math.random() * 0.1 + 0.3,
                    aoeSpeed: (Math.random() * 0.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
                });
            }
        }

        setPegs(pegs);
    }, []);

    return {
        pegs,
        setPegs,
    };
}


function Scene({
    beads,
    setSelectedPeg,
}: {
    beads: Bead[],
    setSelectedPeg: (index: number | null) => void,
}) {
    const {
        pegs,
    } = usePegs();

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
                    onPegClick={(index) => {
                        setSelectedPeg(index);
                    }}
                />
                <GaussianCurve />
                <Beads
                    beads={beads}
                />
            </group>
        </>
    );
}


export default Scene;
