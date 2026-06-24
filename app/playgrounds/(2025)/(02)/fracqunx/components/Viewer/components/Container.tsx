import React from 'react';

import {
    RigidBody,
} from '@react-three/rapier';
import {
    Box,
} from '@react-three/drei';

import * as THREE from 'three';

import {
    wallColor,

    thickness,
} from '../data';



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


export default Container;
