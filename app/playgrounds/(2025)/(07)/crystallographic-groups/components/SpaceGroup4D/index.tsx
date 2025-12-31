'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { spaceGroups4D } from './spaceGroups';

interface SpaceGroup4DProps {
    currentGroup: string;
    onGroupChange: (group: string) => void;
    wSlice: number;
    xyRotation: number;
    xwRotation: number;
    onWSliceChange: (value: number) => void;
    onXYRotationChange: (value: number) => void;
    onXWRotationChange: (value: number) => void;
}

export default function SpaceGroup4D({
    currentGroup,
    onGroupChange,
    wSlice,
    xyRotation,
    xwRotation,
    onWSliceChange,
    onXYRotationChange,
    onXWRotationChange,
}: SpaceGroup4DProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | undefined>(undefined);
    const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
    const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
    const controlsRef = useRef<OrbitControls | undefined>(undefined);
    const points3DRef = useRef<THREE.Points | undefined>(undefined);
    const points4DRef = useRef<THREE.Vector4[]>([]);
    const animationIdRef = useRef<number | undefined>(undefined);

    const groups = spaceGroups4D;

    const generate4DStructure = useCallback(() => {
        points4DRef.current = [];
        const group = currentGroup;
        const range = 1;
        const basis: THREE.Vector4[] = [];

        switch (group) {
            case 'P4_332':
                basis.push(new THREE.Vector4(0, 0, 0, 0));
                break;
            case 'F4_132':
                basis.push(
                    new THREE.Vector4(0, 0, 0, 0),
                    new THREE.Vector4(0.5, 0.5, 0, 0),
                    new THREE.Vector4(0.5, 0, 0.5, 0),
                    new THREE.Vector4(0, 0.5, 0.5, 0),
                    new THREE.Vector4(0.5, 0, 0, 0.5),
                    new THREE.Vector4(0, 0.5, 0, 0.5),
                    new THREE.Vector4(0, 0, 0.5, 0.5)
                );
                break;
        }

        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                for (let k = -range; k <= range; k++) {
                    for (let l = -range; l <= range; l++) {
                        basis.forEach(p => {
                            points4DRef.current.push(
                                new THREE.Vector4(p.x + i, p.y + j, p.z + k, p.w + l)
                            );
                        });
                    }
                }
            }
        }
    }, [currentGroup]);

    const projectAndDraw = useCallback(() => {
        if (!sceneRef.current) return;

        if (points3DRef.current) {
            sceneRef.current.remove(points3DRef.current);
            points3DRef.current.geometry.dispose();
            if (points3DRef.current.material instanceof THREE.Material) {
                points3DRef.current.material.dispose();
            }
        }

        const wSliceValue = wSlice;
        const xyAngle = xyRotation * Math.PI / 180;
        const xwAngle = xwRotation * Math.PI / 180;
        
        const positions: number[] = [];
        const colors: number[] = [];
        const sizes: number[] = [];

        if (points4DRef.current.length === 0) {
            console.warn('No 4D points to project');
            return;
        }
        
        points4DRef.current.forEach(p4 => {
            const p = p4.clone();
            
            let x = p.x * Math.cos(xwAngle) - p.w * Math.sin(xwAngle);
            let w = p.x * Math.sin(xwAngle) + p.w * Math.cos(xwAngle);
            p.x = x;
            p.w = w;
            
            x = p.x * Math.cos(xyAngle) - p.y * Math.sin(xyAngle);
            const y = p.x * Math.sin(xyAngle) + p.y * Math.cos(xyAngle);
            p.x = x;
            p.y = y;
            
            const w_camera = 5;
            const perspective = w_camera / (w_camera - p.w);
            
            if (perspective > 0) {
                const projectedPoint = new THREE.Vector3(p.x, p.y, p.z).multiplyScalar(perspective);
                const distToSlice = Math.abs(p.w - wSliceValue);
                
                if (distToSlice < 0.5) {
                    positions.push(projectedPoint.x, projectedPoint.y, projectedPoint.z);
                    const alpha = 1.0 - (distToSlice / 0.5);
                    const color = new THREE.Color(0x84cc16); // lime-500
                    colors.push(color.r, color.g, color.b);
                    sizes.push(alpha * 25);
                }
            }
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            depthWrite: false
        });
        
        points3DRef.current = new THREE.Points(geometry, material);
        sceneRef.current.add(points3DRef.current);
    }, [wSlice, xyRotation, xwRotation]);

    useEffect(() => {
        if (!mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.set(3, 3, 3);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000); // black
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Generate initial structure
        generate4DStructure();
        projectAndDraw();

        const currentMount = mountRef.current;
        const currentRenderer = renderer;
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (currentMount && currentRenderer.domElement) {
                currentMount.removeChild(currentRenderer.domElement);
            }
            currentRenderer.dispose();
        };
    }, [generate4DStructure, projectAndDraw]);

    useEffect(() => {
        generate4DStructure();
        projectAndDraw();
    }, [generate4DStructure, projectAndDraw]);

    useEffect(() => {
        projectAndDraw();
    }, [projectAndDraw]);

    const handlePrevious = () => {
        const currentIndex = groups.findIndex(g => g.id === currentGroup);
        const newIndex = (currentIndex - 1 + groups.length) % groups.length;
        onGroupChange(groups[newIndex].id);
    };

    const handleNext = () => {
        const currentIndex = groups.findIndex(g => g.id === currentGroup);
        const newIndex = (currentIndex + 1) % groups.length;
        onGroupChange(groups[newIndex].id);
    };

    const currentIndex = groups.findIndex(g => g.id === currentGroup);
    const groupDisplay = groups[currentIndex];

    return (
        <div className="absolute inset-0 flex flex-col p-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-100">4D Space Groups (Projection)</h2>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handlePrevious}
                        className="p-2 bg-black border border-gray-800 hover:border-gray-600 transition-colors"
                        aria-label="Previous group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <span className="text-center font-semibold text-lime-400 w-48">
                        Group {currentIndex + 1} / {groups.length}
                        <br />
                        <span className="text-sm">{groupDisplay.name}</span>
                    </span>
                    <button
                        onClick={handleNext}
                        className="p-2 bg-black border border-gray-800 hover:border-gray-600 transition-colors"
                        aria-label="Next group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-black overflow-hidden">
                <div ref={mountRef} className="w-full h-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label htmlFor="w-slice" className="block text-sm font-medium text-gray-300">
                        W-Slice Position
                    </label>
                    <input
                        id="w-slice"
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        value={wSlice}
                        onChange={(e) => onWSliceChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-400">Slices the 4D structure along the 4th axis.</p>
                </div>
                <div>
                    <label htmlFor="xy-rotation" className="block text-sm font-medium text-gray-300">
                        XY Rotation (3D)
                    </label>
                    <input
                        id="xy-rotation"
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={xyRotation}
                        onChange={(e) => onXYRotationChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-400">Standard rotation in our visible space.</p>
                </div>
                <div>
                    <label htmlFor="xw-rotation" className="block text-sm font-medium text-gray-300">
                        XW Rotation (4D)
                    </label>
                    <input
                        id="xw-rotation"
                        type="range"
                        min="-90"
                        max="90"
                        step="1"
                        value={xwRotation}
                        onChange={(e) => onXWRotationChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-400">Rotation through the 4th dimension.</p>
                </div>
            </div>
        </div>
    );
}