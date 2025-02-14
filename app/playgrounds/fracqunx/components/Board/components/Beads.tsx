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
    bounceFactor,
    radius = BEAD_RADIUS,
}: {
    position: THREE.Vector3,
    pegs: PegData[];
    bounceFactor: number;
    radius?: number,
}) {
    const rigidBodyRef = useRef<RapierRigidBody>(null);


    useFrame(() => {
        if (!rigidBodyRef.current) return;

        const beadPosition = rigidBodyRef.current.translation();

        pegs.forEach(peg => {
            if (!peg.aoe || !peg.aoeSize || !peg.aoeSpeed) return;

            const pegPosition = new THREE.Vector3(peg.x, peg.y + MODEL_Y_OFFSET, 0);

            // Calculate direction vector and distance
            const direction = new THREE.Vector3().subVectors(pegPosition, beadPosition);
            const distance = direction.length();
            const aoeRadius = peg.aoeSize / 2;

            if (distance < aoeRadius && distance > 0) { // Avoid division by zero
                const relativeDistance = distance / aoeRadius;
                let computedForceMagnitude = 0;

                // Conditional falloff: quadratic for attraction, linear for repulsion
                if (peg.aoeSpeed > 0) {
                    // Attraction: smoother force near the center
                    computedForceMagnitude = (peg.aoeSpeed / 1000) * (1 - relativeDistance * relativeDistance);
                } else {
                    // Repulsion: linear falloff works well
                    computedForceMagnitude = (peg.aoeSpeed / 1000) * (1 - relativeDistance);
                }

                // Global scaling to reduce force magnitude
                const globalForceFactor = 0.005;
                const forceMagnitude = computedForceMagnitude * globalForceFactor;

                // Normalize direction and scale by computed force
                direction.normalize().multiplyScalar(forceMagnitude);

                rigidBodyRef.current!.applyImpulse(
                    { x: direction.x, y: direction.y, z: direction.z },
                    true
                );
            }
        });
    });


    return (
        <RigidBody
            ref={rigidBodyRef}
            type="dynamic"
            position={position}
            colliders="ball"
            restitution={bounceFactor}
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
    bounceFactor,
} : {
    beads: BeadData[];
    pegs: PegData[];
    bounceFactor: number;
}) {
    return (
        <>
            {beads.map((bead, index) => (
                <Bead
                    key={index + bead.id}
                    position={bead.position}
                    pegs={pegs}
                    bounceFactor={bounceFactor}
                />
            ))}
        </>
    );
}


export default Beads;
