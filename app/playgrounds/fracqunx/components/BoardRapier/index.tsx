import React, {
    useState,
    useEffect,
} from 'react';
import {
    Canvas,
 } from '@react-three/fiber';
import {
    Physics,
} from '@react-three/rapier';

import Scene, {
    Bead,
} from './Scene';



function Board() {
    const [beads, setBeads] = useState<Bead[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [areaOfEffect, setAreaOfEffect] = useState(false);
    const [morphodynamics, setMorphodynamics] = useState(false);


    // const spawnBead = () => {
    //     // const randomX = (Math.random() - 0.5) * 2
    //     const randomX = 0
    //     setBeads(prev => [...prev, { id: Date.now() + Math.random(), position: [randomX, beadYStart, 0] }])
    // }

    const addBeads = () => {
        const triangleHeight = 2; // Height of triangle above flippers
        const triangleBase = 3; // Base width between flippers
        const density = 0.1; // Space between beads
        const flipperY = 3.7; // Y position of flippers

        const newBeads: Bead[] = [];

        // Generate rows of beads that form a triangle
        for (let y = 0; y < triangleHeight; y += density) {
            // Calculate width of current row (wider at top, narrower at bottom)
            const rowWidth = triangleBase * (y / triangleHeight);
            const beadsInRow = Math.floor(rowWidth / density);

            // Generate beads for current row
            for (let i = 0; i < beadsInRow; i++) {
                const x = -rowWidth/2 + i * density;
                const bead: Bead = {
                    id: Date.now() + Math.random(),
                    position: [
                        x, // X position
                        flipperY + y, // Y position (starting from flipper height)
                        0 // Z position
                    ] as any,
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
            <Canvas
                shadows="soft"
            >
                <Physics
                    gravity={[0, -9.81, 0]}
                    paused={!isRunning}
                >
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
                        onClick={addBeads}
                        className="px-4 py-2 bg-lime-50 min-w-[180px] text-black hover:bg-lime-200 transition-colors"
                    >
                        Add Beads
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
