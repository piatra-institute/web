import React, {
    useRef,
} from 'react';
import {
    RigidBody, RapierRigidBody,
} from '@react-three/rapier';
import {
    useFrame,
} from '@react-three/fiber';

import * as THREE from 'three';

import {
    PegData,
    BeadData,

    beadColor,

    BEAD_RADIUS,
} from '../data';



const isInsideCircle = (x: number, y: number, cx: number, cy: number, r: number) => {
    return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2;
};

function Bead({
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
    beads: BeadData[];
    pegs: PegData[];
}) {
    return (
        <>
            {beads.map((bead, index) => (
                <Bead
                    key={index + bead.id}
                    position={bead.position}
                    pegs={pegs}
                />
            ))}
        </>
    );
}


export default Beads;
