import React, {
    useState,
    useEffect,
} from 'react';
import {
    Canvas,
 } from '@react-three/fiber';
import {
    Physics, RigidBody, CuboidCollider,
} from '@react-three/rapier';
import {
    OrthographicCamera, Box, OrbitControls,
} from '@react-three/drei';

import * as THREE from 'three';



const wallColor = '#FFD700';
const beadColor = '#50C878';
const pegColor = '#C0C0C0';

const beadYStart = 4.5


export interface Bead {
    id: number;
    position: number[];
}


function Container() {
    const opacity = 0.2;
    const thickness = 0.16;

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


function Bead({ position, radius = 0.04 }: any) {
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
    )
}


function Scene({
    beads,
} : {
    beads: Bead[],
}) {
    const pegsYStart = 6

    const width = 10
    const height = 30
    const pegRadius = 0.08
    const pegSpacing = 0.3

    const pegs = []
    for (let row = 0; row < 14; row++) {
        // const numPegsInRow = 14 - Math.floor(row / 2)
        const numPegsInRow = 11
        for (let col = 0; col < numPegsInRow; col++) {
            const offset = row % 2 === 0 ? 0 : 0.15
            const x = -0.05 + (col - (numPegsInRow - 1) / 2) * pegSpacing + offset
            const y = pegsYStart + -row * pegSpacing - 2
            pegs.push([x, y])
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
                <Bead key={index + bead.id} position={bead.position} />
            ))}
        </>
    );
}


function Board() {
    const [beads, setBeads] = useState<Bead[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [areaOfEffect, setAreaOfEffect] = useState(false);
    const [morphodynamics, setMorphodynamics] = useState(false);


    // const spawnBead = () => {
    //     // const randomX = (Math.random() - 0.5) * 2
    //     const randomX = 0
    //     setBeads(prev => [...prev, { id: Date.now() + Math.random(), position: [randomX, beadYStart, 0] }])

    //     // for (let i = 0; i < 1500; i++) {
    //     //     setBeads(prev => [...prev, {
    //     //         id: Date.now() + Math.random() + Math.random() +  Math.random() + Math.random() +  Math.random() + Math.random(),
    //     //         position: [randomX, beadYStart + i * 0.2, 0] }])
    //     // }
    // }

    const spawnBead = () => {
        const triangleHeight = 0.8; // Height of triangle above flippers
        const triangleBase = 1.2; // Base width between flippers
        const density = 0.1; // Space between beads
        const flipperY = 5; // Y position of flippers

        const newBeads: any[] = [];

        // Generate rows of beads that form a triangle
        for (let y = 0; y < triangleHeight; y += density) {
            // Calculate width of current row (wider at bottom, narrower at top)
            const rowWidth = triangleBase * (1 - y / triangleHeight);
            const beadsInRow = Math.floor(rowWidth / density);

            // Generate beads for current row
            for (let i = 0; i < beadsInRow; i++) {
                const x = -rowWidth/2 + i * density;
                const bead = {
                    id: Date.now() + Math.random(),
                    position: [
                        x, // X position
                        flipperY + y, // Y position (starting from flipper height)
                        0 // Z position
                    ]
                };
                newBeads.push(bead);
            }
        }

        setBeads(prev => [...prev, ...newBeads]);
    };


    const reset = () => {
        setBeads([]);
    }


    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         spawnBead();
    //     }, 100);

    //     return () => clearInterval(interval);
    // }, []);


    return (
        <div className="h-dvh w-full">
            <Canvas>
                <Physics gravity={[0, -9.81, 0]}>
                    <Scene
                        beads={beads}
                    />
                </Physics>
            </Canvas>

            <div
                className="absolute bottom-8 left-0 right-0"
            >
                <div
                    className="flex gap-4 m-4 items-center justify-center"
                >
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-lime-50 min-w-[180px] text-black hover:bg-lime-200 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={
                            `px-4 py-2 min-w-[180px] text-black hover:bg-lime-200 transition-colors ${isRunning ? 'bg-lime-50' : 'bg-lime-200'}`
                        }
                    >
                        {isRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button
                        onClick={spawnBead}
                        className="px-4 py-2 bg-lime-50 min-w-[180px] text-black hover:bg-lime-200 transition-colors"
                    >
                        Add Bead
                    </button>
                </div>

                <div
                    className="flex gap-4 m-4 items-center justify-center"
                >
                    <button
                        onClick={() => setAreaOfEffect(!areaOfEffect)}
                        className={
                            `px-4 py-2 min-w-[180px] text-black hover:bg-lime-200 transition-colors ${areaOfEffect ? 'bg-lime-200' : 'bg-lime-50'}`
                        }
                    >
                        Area of Effect
                    </button>
                    <button
                        onClick={() => setMorphodynamics(!morphodynamics)}
                        className={
                            `px-4 py-2 min-w-[180px] text-black hover:bg-lime-200 transition-colors ${morphodynamics ? 'bg-lime-200' : 'bg-lime-50'}`
                        }
                    >
                        Morphodynamics
                    </button>
                </div>
            </div>
        </div>
    );
}


export default Board;
