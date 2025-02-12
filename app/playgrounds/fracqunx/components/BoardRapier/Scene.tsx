import React, {
    useRef,
} from 'react';
import {
    RigidBody, RapierRigidBody,
} from '@react-three/rapier';
import {
    OrthographicCamera, Box, OrbitControls,
} from '@react-three/drei';
import {
    useFrame,
} from '@react-three/fiber';

import * as THREE from 'three';

import Pegs from './Pegs';

import {
    PegData,

    wallColor,
    beadColor,
    pegColor,

    pegRadius,

    opacity,
    thickness,

    BEAD_RADIUS,
} from './data';



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

const isInsideCircle = (x: number, y: number, cx: number, cy: number, r: number) => {
    return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2;
};

function BeadMesh({
    position,
    pegs,
    radius = BEAD_RADIUS,
}: {
    position: THREE.Vector3,
    pegs: PegData[];
    radius?: number,
}) {
    const rigidBodyRef = useRef<RapierRigidBody>(null);

    useFrame(() => {
        if (!rigidBodyRef.current) return;

        const beadPosition = rigidBodyRef.current.translation();

        pegs.forEach(peg => {
            if (!peg.aoe || !peg.aoeSize || !peg.aoeSpeed) return;

            const inAoE = isInsideCircle(
                beadPosition.x,
                beadPosition.y,
                peg.x,
                peg.y - 2,
                peg.aoeSize / 2,
            );

            if (inAoE) {
                const FORCE_MULTIPLIER = 0.01
                const MIN_DISTANCE = 0.01
                const FORCE_DAMPENING = 0.01
                const SAFETY_RADIUS = 0.6

                const currentVelocity = rigidBodyRef.current!.linvel();

                // Calculate distance between bead and peg
                const dx = peg.x - beadPosition.x;
                const dy = peg.y - beadPosition.y - 2;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < SAFETY_RADIUS || distance > peg.aoeSize) return

                // Normalize direction vector
                const nx = dx / distance
                const ny = dy / distance

                // Adjusted force calculation with stronger distance consideration
                const distanceFactor = (distance - SAFETY_RADIUS) / (peg.aoeSize - SAFETY_RADIUS)
                const forceMagnitude = Math.max(
                    distanceFactor *
                    peg.aoeSpeed *
                    FORCE_MULTIPLIER *
                    FORCE_DAMPENING,
                    MIN_DISTANCE
                )

                // Apply velocity damping
                const velocityMagnitude = Math.sqrt(
                    currentVelocity.x * currentVelocity.x +
                    currentVelocity.y * currentVelocity.y
                )
                const velocityDamping = Math.max(1 - velocityMagnitude * 0.1, 0.2)

                // Calculate final force with safety checks
                const finalForce = {
                    x: nx * forceMagnitude * velocityDamping,
                    y: ny * forceMagnitude * velocityDamping,
                    z: 0
                }

                // Add small random variation to prevent sticking
                const jitter = 0.01
                finalForce.x += (Math.random() - 0.5) * jitter
                finalForce.y += (Math.random() - 0.5) * jitter

                rigidBodyRef.current!.applyImpulse(finalForce, true)
            }
        });
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="dynamic"
            position={position}
            colliders="ball"
            restitution={0.5}
            friction={0.1}
            linearDamping={0.2}
            angularDamping={0.2}
            mass={0.2}
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
    pegs,
} : {
    beads: Bead[];
    pegs: PegData[];
}) {
    return (
        <>
            {beads.map((bead, index) => (
                <BeadMesh
                    key={index + bead.id}
                    position={bead.position}
                    pegs={pegs}
                />
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


function Scene({
    pegs,
    beads,
    setSelectedPeg,
    areaOfEffect,
}: {
    pegs: PegData[];
    beads: Bead[];
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
