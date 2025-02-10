import React, {
    useState,
    useEffect,
} from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { OrthographicCamera, Box, OrbitControls } from '@react-three/drei'



function Container() {
    const opacity = 0.3;
    const thickness = 0.16;

    return (
        <>
            {/* Bottom */}
            <RigidBody type="fixed">
                <Box args={[4, 0.2, thickness * 3]} position={[0, -2.3, 0]}>
                    <meshStandardMaterial color="red" />
                </Box>
            </RigidBody>

            {/* Walls */}
            <RigidBody type="fixed">
                {/* Left */}
                <Box args={[0.2, 7, thickness]} position={[-1.96, 1.1, 0]}>
                    <meshStandardMaterial color="red" transparent opacity={opacity} />
                </Box>

                {Array.from({ length: 18 }).map((_, i) => (
                    <Box
                        key={i}
                        args={[0.02, 2, thickness]} position={[-1.7 + 0.2 * i, -1.2, 0]}
                    >
                        <meshStandardMaterial color="red" transparent opacity={opacity} />
                    </Box>
                ))}

                {/* Right */}
                <Box args={[0.2, 7, thickness]} position={[1.96, 1.1, 0]}>
                    <meshStandardMaterial color="red" transparent opacity={opacity} />
                </Box>

                {/* Back */}
                <Box args={[4, 7, 0.2]} position={[0, 1.1, -thickness - 0.02]}>
                    <meshStandardMaterial color="red" transparent opacity={opacity} />
                </Box>

                {/* Front */}
                <Box args={[4, 7, 0.2]} position={[0, 1.1, thickness + 0.02]}>
                    <meshStandardMaterial color="red" transparent opacity={opacity} />
                </Box>
            </RigidBody>
        </>
    );
}


function Ball({ position, radius = 0.04 }: any) {
    return (
        <RigidBody
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
                <meshStandardMaterial color="red" />
            </mesh>
        </RigidBody>
    )
}



function Board() {
    const pegsYStart = 6
    const beadYStart = 6

    const width = 10
    const height = 30
    const pegRadius = 0.08
    const pegSpacing = 0.3

    const [balls, setBalls] = useState<any[]>([
        // ...Array.from({ length: 1000 }).map(() => ({
        //     id: Date.now(),
        //     position: [(Math.random() - 0.5) * 2, 6, 0]
        // }))
    ])


    const spawnBall = () => {
        const randomX = (Math.random() - 0.5) * 2
        setBalls(prev => [...prev, { id: Date.now(), position: [randomX, beadYStart, 0] }])
    }


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


    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         spawnBall();
    //     }, 100);

    //     return () => clearInterval(interval);
    // }, []);


    return (
        <div className="h-dvh w-full">
            <button
                onClick={spawnBall}
                className="absolute z-50 bottom-4 left-4 px-4 py-2 bg-lime-50 text-black"
            >
                Drop Ball
            </button>
            <Canvas>
                <OrthographicCamera
                    makeDefault
                    position={[0, 0, 10]}
                    zoom={80}
                />
                <OrbitControls />

                <ambientLight intensity={1} />
                <directionalLight position={[-10, 10, 0]} intensity={1} />
                <Physics gravity={[0, -9.81, 0]}>
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
                            restitution={0.7}
                            colliders="ball"
                        >
                            <mesh>
                                <sphereGeometry args={[pegRadius]} />
                                <meshStandardMaterial color="gray" />
                            </mesh>
                        </RigidBody>
                    ))}

                    {/* {Array.from({ length: 14 }).map((_, i) => (
                        <RigidBody
                            key={`divider-${i}`}
                            type="fixed"
                            position={[-4 + i * 1.2, 2, 0]}
                            restitution={0.7}
                        >
                            <mesh>
                                <boxGeometry args={[0.01, 0.2, 0.05]} />
                                <meshStandardMaterial color="gray" />
                            </mesh>
                        </RigidBody>
                    ))} */}

                    <Container />

                    {balls.map(ball => (
                        <Ball key={ball.id} position={ball.position} />
                    ))}
                </Physics>
            </Canvas>
        </div>
    )
}

export default Board;
