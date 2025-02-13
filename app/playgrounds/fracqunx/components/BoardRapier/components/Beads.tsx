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

    MODEL_Y_OFFSET,
} from '../data';



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

            // Calculate distance and direction to peg
            const dx = peg.x - beadPosition.x;
            const dy = (peg.y + MODEL_Y_OFFSET) - beadPosition.y;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);

            // Check if bead is within AoE
            const aoeRadius = peg.aoeSize / 2;
            if (distance > aoeRadius) return;

            // Constants for force calculation
            const INNER_RADIUS = 0.8;  // Distance where force starts to decrease
            const FORCE_SCALE = 0.005; // Base force multiplier
            const MAX_FORCE = 0.02;    // Maximum force cap

            // Calculate normalized direction
            const nx = dx / distance;
            const ny = dy / distance;

            // Smooth force falloff using inverse square law with inner radius
            let forceMagnitude;
            if (distance < INNER_RADIUS) {
                // Reduce force when very close to prevent overwhelming attraction
                forceMagnitude = (distance / INNER_RADIUS) * FORCE_SCALE;
            } else {
                // Gradual falloff from inner radius to edge of AoE
                const normalizedDistance = (distance - INNER_RADIUS) / (aoeRadius - INNER_RADIUS);
                forceMagnitude = (1 - normalizedDistance) * FORCE_SCALE;
            }

            // Apply peg's aoeSpeed as a multiplier
            forceMagnitude *= peg.aoeSpeed / 100;

            // Cap the maximum force
            forceMagnitude = Math.min(forceMagnitude, MAX_FORCE);

            // Get current velocity for damping
            const currentVelocity = rigidBodyRef.current!.linvel();
            const velocityMagnitude = Math.sqrt(
                currentVelocity.x * currentVelocity.x +
                currentVelocity.y * currentVelocity.y
            );

            // Apply velocity-based damping to prevent excessive acceleration
            const DAMPING_FACTOR = 0.8;
            const velocityDamping = 1 / (1 + velocityMagnitude * DAMPING_FACTOR);

            // Calculate final force with damping
            const finalForce = {
                x: nx * forceMagnitude * velocityDamping * (peg.aoeSpeed > 0 ? 1 : -1),
                y: ny * forceMagnitude * velocityDamping * (peg.aoeSpeed > 0 ? 1 : -1),
                z: 0
            };

            // Add tiny random variation to prevent beads from getting stuck
            const JITTER = 0.0005;
            finalForce.x += (Math.random() - 0.5) * JITTER;
            finalForce.y += (Math.random() - 0.5) * JITTER;

            // Apply the force as an impulse
            rigidBodyRef.current!.applyImpulse(finalForce, true);
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
