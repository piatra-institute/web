'use client';

import { Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';



interface ViewerProps {
    capacity: number; gSD: number; eSD: number; k: number; zSlice: number;
    showLatent: boolean; showPlane: boolean; showHalos: boolean;
    setRatio: (ratio: number) => void;
    setAxisVar: (v:{x:number;y:number;z:number}) => void;
}

/* helper geometries & materials outside component for perf */
const ringGeom = new THREE.RingGeometry(0.08, 0.1, 32);
const latentMat = new THREE.MeshBasicMaterial({ color: '#00e0ff', opacity: 0.25, transparent: true, side: THREE.DoubleSide });
const haloMat = new THREE.SpriteMaterial({ color: '#a855f7', opacity: 0.4, transparent: true, depthWrite: false });
const sphereMat = new THREE.MeshStandardMaterial({ color: '#56be30', emissive: '#597a20', emissiveIntensity: 0.5, transparent: true, opacity: 0.75 });

export default function Viewer(props: ViewerProps) {
    const { capacity, gSD, eSD, k, zSlice, showLatent, showPlane, showHalos } = props;

    const { latent, buffered, ratio, axisVar } = useMemo(() => {
        const lat: number[][] = [];
        const buf: number[][] = [];

        let sumLat = 0;
        let sumBuf = 0;
        let sumXBuf = 0, sumYBuf = 0, sumZBuf = 0;

        for (let i = 0; i < 500; i++) {
            const gx = gSD * THREE.MathUtils.randFloatSpread(2);
            const gy = gSD * 0.4 * THREE.MathUtils.randFloatSpread(2);
            const gz = gSD * 0.2 * THREE.MathUtils.randFloatSpread(2);

            const ex = eSD * THREE.MathUtils.randFloatSpread(2);
            const ey = eSD * THREE.MathUtils.randFloatSpread(2);
            const ez = eSD * THREE.MathUtils.randFloatSpread(2);

            const x = gx + ex;
            const y = gy + ey;
            const z = gz + ez;
            lat.push([x, y, z]);

            const r = Math.sqrt(x * x + y * y + z * z);
            const f = 1 / (1 + Math.exp(-k * (r - (1 - capacity))));
            const bx = x * f,
                by = y * f,
                bz = z * f;
            buf.push([bx, by, bz]);

            /* accumulate squared radii for variance */
            sumLat += x * x + y * y + z * z;
            sumBuf += bx * bx + by * by + bz * bz;

            sumXBuf += bx*bx;
            sumYBuf += by*by;
            sumZBuf += bz*bz;
        }

        const varianceLat = sumLat / 500;
        const varianceBuf = sumBuf / 500;
        const ratio = varianceBuf / varianceLat; // 0 = perfect canalization, 1 = none

        const varXBuf = sumXBuf / 500;
        const varYBuf = sumYBuf / 500;
        const varZBuf = sumZBuf / 500;

        return {
            latent: lat,
            buffered: buf,
            ratio,
            axisVar: {
                x: varXBuf, y: varYBuf, z: varZBuf,
            },
        };
    }, [capacity, gSD, eSD, k]);

    const visLat = useMemo(() => latent.filter(([, , z]) => z <= zSlice), [latent, zSlice]);
    const visBuf = useMemo(() => buffered.filter(([, , z]) => z <= zSlice), [buffered, zSlice]);

    useEffect(() => {
        props.setRatio(ratio);
        props.setAxisVar(axisVar);
    }, [ratio, axisVar, props]);


    return (
        <Canvas camera={{ position: [5, 2, -5], fov: 35 }}>
            <color attach="background" args={['#0d0d0d']} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[4, 8, 5]} intensity={1} />

            {/* axes */}
            <axesHelper args={[3]} />

            {/* latent rings */}
            {showLatent && (
                <group>
                    {visLat.map(([x, y, z], i) => (
                        <mesh geometry={ringGeom} material={latentMat} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} key={i} />
                    ))}
                </group>
            )}

            {/* buffered spheres */}
            <group>
                {visBuf.map(([x, y, z], i) => (
                    <group position={[x, y, z]} key={i}>
                        <Sphere args={[0.06, 12, 12]} material={sphereMat} />
                        {showHalos && <sprite material={haloMat} scale={[0.28, 0.28, 0.28]} />}
                    </group>
                ))}
            </group>

            {/* z-plane */}
            {showPlane && (
                <mesh position={[0, 0, zSlice]}>
                    <planeGeometry args={[6, 6]} />
                    <meshBasicMaterial color="yellow" transparent opacity={0.18} side={THREE.DoubleSide} />
                </mesh>
            )}

            <OrbitControls makeDefault />
            <Suspense fallback={null} />
        </Canvas>
    );
}
