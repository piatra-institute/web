import React from 'react';
import {
    RigidBody, CuboidCollider,
} from '@react-three/rapier';
import {
    OrthographicCamera, Box, OrbitControls,
} from '@react-three/drei';

import * as THREE from 'three';



const wallColor = '#FFD700';
const beadColor = '#50C878';
const pegColor = '#C0C0C0';


const pegsYStart = 6;

const width = 10;
const height = 30;
const pegRadius = 0.08;
const pegSpacing = 0.3;

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
                    args={[2, 0.2, thickness]} position={[-1.05, 4.8, 0]}
                    rotation={[0, 0, -Math.PI / 7]}
                >
                    <meshStandardMaterial color={wallColor} />
                </Box>
            </RigidBody>

            {/* Right Flipper */}
            <RigidBody type="fixed">
                <Box
                    args={[2, 0.2, thickness]} position={[1.05, 4.8, 0]}
                    rotation={[0, 0, Math.PI / 7]}
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

                {Array.from({ length: 18 }).map((_, i) => (
                    <Box
                        key={i}
                        args={[0.02, 2, thickness]} position={[-1.7 + 0.2 * i, -1.2, 0]}
                    >
                        <meshStandardMaterial
                            color={wallColor}
                            emissive={wallColor}
                            transparent={false}
                        />
                    </Box>
                ))}

                {/* Back */}
                <Box args={[4, 8.2, 0.2]} position={[0, 1.7, -thickness - 0.02]}>
                    <meshStandardMaterial color={wallColor} transparent opacity={opacity}
                        side={THREE.DoubleSide}
                    />
                </Box>

                {/* Front */}
                <Box args={[4, 8.2, 0.2]} position={[0, 1.7, thickness + 0.02]}>
                    <meshStandardMaterial color={wallColor} transparent opacity={opacity}
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


function Scene({
    beads,
} : {
    beads: Bead[],
}) {
    const pegs = [];
    for (let row = 0; row < 14; row++) {
        // const numPegsInRow = 14 - Math.floor(row / 2)
        const numPegsInRow = 11;
        for (let col = 0; col < numPegsInRow; col++) {
            const offset = row % 2 === 0 ? 0 : 0.15;
            const x = -0.05 + (col - (numPegsInRow - 1) / 2) * pegSpacing + offset;
            const y = pegsYStart + -row * pegSpacing - 2;
            pegs.push([x, y]);
        }
    }

    return (
        <>
            <ambientLight intensity={1} />
            <directionalLight position={[-10, 10, 0]} intensity={1} />

            {/* <OrthographicCamera
                makeDefault
                position={[0, 0, 10]}
                zoom={80}
            /> */}
            <OrthographicCamera
                makeDefault
                position={[0, 0, 10]}
                zoom={80}
                near={0.1}
                far={1000}
            />
            <OrbitControls />

            <RigidBody type="fixed">
                <CuboidCollider args={[0.5, height, 1]} position={[-width / 2, 0, 0]} />
                <CuboidCollider args={[0.5, height, 1]} position={[width / 2, 0, 0]} />
                <CuboidCollider args={[width, 0.5, 1]} position={[0, -height / 2, 0]} />
            </RigidBody>

            {pegs.map(([x, y], i) => (
                <RigidBody
                    key={i}
                    type="fixed"
                    position={[x, y, 0]}
                    // restitution={0.7}
                    colliders="ball"
                >
                    <mesh>
                        <sphereGeometry args={[pegRadius]} />
                        <meshStandardMaterial
                            color={pegColor}
                        />
                    </mesh>
                </RigidBody>
            ))}

            <Container />

            {beads.map((bead, index) => (
                <BeadMesh key={index + bead.id} position={bead.position} />
            ))}
        </>
    );
}


export default Scene;
