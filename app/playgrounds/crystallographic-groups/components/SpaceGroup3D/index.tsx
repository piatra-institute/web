'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { spaceGroups3D } from './spaceGroups';

interface SpaceGroup3DProps {
    currentGroup: string;
    onGroupChange: (group: string) => void;
}

export default function SpaceGroup3D({ currentGroup, onGroupChange }: SpaceGroup3DProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene>();
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const cameraRef = useRef<THREE.PerspectiveCamera>();
    const controlsRef = useRef<OrbitControls>();
    const atomsRef = useRef<THREE.Group>();
    const animationIdRef = useRef<number>();

    const groups = spaceGroups3D;

    const createAtom = (position: THREE.Vector3, color = 0x84cc16) => { // lime-500
        const geometry = new THREE.SphereGeometry(0.2, 32, 16);
        const material = new THREE.MeshLambertMaterial({ color });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(position);
        return sphere;
    };

    const createUnitCellBox = (params: { a: number; b: number; c: number }) => {
        const { a, b, c } = params;
        const geometry = new THREE.BoxGeometry(a, b, c);
        const edges = new THREE.EdgesGeometry(geometry);
        const box = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x6b7280 })
        );
        box.position.set(a / 2, b / 2, c / 2);
        return box;
    };

    const generateStructure = useCallback(() => {
        if (!atomsRef.current) return;
        
        while (atomsRef.current.children.length > 0) {
            atomsRef.current.remove(atomsRef.current.children[0]);
        }

        const group = currentGroup;
        const p = new THREE.Vector3(0.15, 0.25, 0.35);
        let cellParams = { a: 3, b: 3, c: 3 };
        let positions: THREE.Vector3[] = [];

        switch (group) {
            case 'P1':
                positions.push(p);
                break;
            case 'P-1':
                positions.push(p, new THREE.Vector3(-p.x, -p.y, -p.z));
                break;
            case 'P2/m':
                cellParams = { a: 3, b: 4, c: 3.5 };
                positions.push(
                    p,
                    new THREE.Vector3(-p.x, p.y, -p.z),
                    new THREE.Vector3(p.x, -p.y, p.z),
                    new THREE.Vector3(-p.x, -p.y, -p.z)
                );
                break;
            case 'P21/c':
                cellParams = { a: 3, b: 4, c: 3.5 };
                positions.push(
                    p,
                    new THREE.Vector3(-p.x, p.y + 0.5, -p.z + 0.5),
                    new THREE.Vector3(-p.x, -p.y, -p.z),
                    new THREE.Vector3(p.x, -p.y - 0.5, p.z - 0.5)
                );
                break;
            case 'Pmmm':
                cellParams = { a: 3, b: 4, c: 5 };
                for (let i = -1; i <= 1; i += 2) {
                    for (let j = -1; j <= 1; j += 2) {
                        for (let k = -1; k <= 1; k += 2) {
                            positions.push(new THREE.Vector3(p.x * i, p.y * j, p.z * k));
                        }
                    }
                }
                break;
            case 'Pca21':
                cellParams = { a: 4, b: 3, c: 5 };
                positions.push(
                    p,
                    new THREE.Vector3(-p.x, -p.y, p.z + 0.5),
                    new THREE.Vector3(p.x + 0.5, -p.y, p.z),
                    new THREE.Vector3(-p.x + 0.5, p.y, p.z + 0.5)
                );
                break;
            case 'P4/mmm':
                cellParams = { a: 4, b: 4, c: 5 };
                for (let i = -1; i <= 1; i += 2) {
                    for (let j = -1; j <= 1; j += 2) {
                        positions.push(new THREE.Vector3(p.x * i, p.y * j, 0));
                        positions.push(new THREE.Vector3(p.x * i, p.y * j, p.z));
                        positions.push(new THREE.Vector3(p.x * i, p.y * j, -p.z));
                    }
                }
                break;
            case 'R-3m':
                cellParams = { a: 4, b: 4, c: 6 };
                positions.push(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0.333, 0.667, 0.333),
                    new THREE.Vector3(0.667, 0.333, 0.667)
                );
                break;
            case 'P6/mmm':
                cellParams = { a: 4, b: 4, c: 5 };
                const theta60 = Math.PI / 3;
                for (let i = 0; i < 6; i++) {
                    const angle = i * theta60;
                    positions.push(new THREE.Vector3(p.x * Math.cos(angle), p.x * Math.sin(angle), 0));
                    positions.push(new THREE.Vector3(p.x * Math.cos(angle), p.x * Math.sin(angle), p.z));
                    positions.push(new THREE.Vector3(p.x * Math.cos(angle), p.x * Math.sin(angle), -p.z));
                }
                break;
            case 'P213':
                cellParams = { a: 4, b: 4, c: 4 };
                const p_cub = new THREE.Vector3(0.1, 0.2, 0.3);
                positions.push(
                    p_cub,
                    new THREE.Vector3(-p_cub.x + 0.5, -p_cub.y, p_cub.z + 0.5),
                    new THREE.Vector3(-p_cub.x, p_cub.y + 0.5, -p_cub.z + 0.5),
                    new THREE.Vector3(p_cub.x + 0.5, -p_cub.y + 0.5, -p_cub.z),
                    new THREE.Vector3(p_cub.z, p_cub.x, p_cub.y),
                    new THREE.Vector3(p_cub.y, p_cub.z, p_cub.x)
                );
                break;
            case 'Pm-3m':
                positions.push(new THREE.Vector3(0, 0, 0));
                break;
            case 'Fm-3m':
                positions.push(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0.5, 0.5, 0),
                    new THREE.Vector3(0.5, 0, 0.5),
                    new THREE.Vector3(0, 0.5, 0.5)
                );
                break;
            case 'Im-3m':
                positions.push(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0.5, 0.5, 0.5)
                );
                break;
            case 'Fd-3m':
                const diamondBasis = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0.5, 0.5, 0),
                    new THREE.Vector3(0.5, 0, 0.5),
                    new THREE.Vector3(0, 0.5, 0.5)
                ];
                diamondBasis.forEach(v => {
                    positions.push(v, new THREE.Vector3(v.x + 0.25, v.y + 0.25, v.z + 0.25));
                });
                break;
            default:
                positions.push(p);
        }

        const { a, b, c } = cellParams;
        const range = 1;
        
        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                for (let k = -range; k <= range; k++) {
                    positions.forEach(pos => {
                        atomsRef.current!.add(
                            createAtom(
                                new THREE.Vector3(
                                    (pos.x + i) * a,
                                    (pos.y + j) * b,
                                    (pos.z + k) * c
                                )
                            )
                        );
                    });
                }
            }
        }
        
        atomsRef.current.add(createUnitCellBox(cellParams));
    }, [currentGroup]);

    useEffect(() => {
        if (!mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(5, 5, 5);
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
        controls.dampingFactor = 0.1;
        controls.minDistance = 2;
        controls.maxDistance = 50;
        controlsRef.current = controls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const atoms = new THREE.Group();
        atomsRef.current = atoms;
        scene.add(atoms);

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
        generateStructure();

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

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
    }, [generateStructure]);

    useEffect(() => {
        generateStructure();
    }, [generateStructure]);

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
                <h2 className="text-2xl font-bold text-gray-100">Expanded Space Groups</h2>
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
                    <span className="text-center font-semibold text-lime-400 w-56">
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
        </div>
    );
}