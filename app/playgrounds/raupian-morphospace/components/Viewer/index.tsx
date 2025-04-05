'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



function createShellGeometry(W: number, D: number, T: number): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];
    const initial_a = 0.5;
    const a = initial_a / Math.max(1, W * 0.5);
    const b = Math.log(W) / (2 * Math.PI);
    const numPoints = 400;
    const maxTheta = (4 + 8 / Math.sqrt(W)) * Math.PI;

    for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * maxTheta;
        const r = a * Math.exp(b * theta);
        points.push(new THREE.Vector3(
            r * Math.cos(theta),
            r * Math.sin(theta),
            T * r * theta / (2 * Math.PI)
        ));
    }

    if (points.length < 2) {
        return new THREE.BufferGeometry();
    }

    const box = new THREE.Box3().setFromPoints(points);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredMaxSize = 6;
    const scaleFactor = maxDim > 0.001 ? desiredMaxSize / maxDim : 1;

    const scaledPoints = points.map(p => p.clone().multiplyScalar(scaleFactor));

    const curve = new THREE.CatmullRomCurve3(scaledPoints);

    const originalFinalRadius = points[points.length - 1]?.length() ?? 0.1;
    const tubeRadius = Math.max(0.01, D * originalFinalRadius * 0.05 * scaleFactor);

    const geometry = new THREE.TubeGeometry(curve, 200, tubeRadius, 16, false);
    return geometry;
}


interface ViewerProps {
    W: number;
    D: number;
    T: number;
    autoRotate: boolean;
    setW: (value: number) => void;
    setD: (value: number) => void;
    setT: (value: number) => void;
}

interface MarkerUserData {
    W: number;
    D: number;
    T: number;
    isMarker: true;
}


const Viewer: React.FC<ViewerProps> = ({ W, D, T, autoRotate, setW, setD, setT }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const currentShellRef = useRef<THREE.Mesh | null>(null);
    const floatingMarkerRef = useRef<THREE.Mesh | null>(null);
    const shellsGroupRef = useRef<THREE.Group | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const raycasterRef = useRef<THREE.Raycaster | null>(null);
    const pointerRef = useRef<THREE.Vector2 | null>(null);

    const autoRotateRef = useRef(autoRotate);

    const populateMorphospace = (scene: THREE.Scene): THREE.Group => {
        const group = new THREE.Group();
        const markerGeom = new THREE.SphereGeometry(0.1, 16, 16);
        const markerMat = new THREE.MeshStandardMaterial({
            color: 0x2E8B57, // SeaGreen
            roughness: 0.7,
            metalness: 0.5,
        });

        for (let wVal = 1; wVal <= 5; wVal += 0.5) {
            for (let dVal = 0.1; dVal <= 1.0; dVal += 0.2) {
                for (let tVal = 0; tVal <= 3; tVal += 0.5) {
                    const marker = new THREE.Mesh(markerGeom.clone(), markerMat.clone());
                    marker.position.set(wVal, dVal * 5, tVal);
                    marker.userData = { W: wVal, D: dVal, T: tVal, isMarker: true } as MarkerUserData;
                    group.add(marker);
                }
            }
        }
        scene.add(group);
        return group;
    };

    const updateVisualization = (scene: THREE.Scene, W_val: number, D_val: number, T_val: number) => {
        // Update floating marker position
        if (floatingMarkerRef.current) {
            floatingMarkerRef.current.position.set(W_val, D_val * 5, T_val);
        } else {
            const markerGeom = new THREE.SphereGeometry(0.15, 16, 16);
            const markerMat = new THREE.MeshBasicMaterial({ color: 0x90EE90 }); // LightGreen
            floatingMarkerRef.current = new THREE.Mesh(markerGeom, markerMat);
            floatingMarkerRef.current.position.set(W_val, D_val * 5, T_val);
            scene.add(floatingMarkerRef.current);
        }

        if (currentShellRef.current) {
            scene.remove(currentShellRef.current);
            currentShellRef.current.geometry.dispose();
            // Dispose material properly (check if array or single)
            if (Array.isArray(currentShellRef.current.material)) {
                currentShellRef.current.material.forEach(m => m.dispose());
            } else if (currentShellRef.current.material) { // Check if material exists
                currentShellRef.current.material.dispose();
            }
            currentShellRef.current = null;
        }

        try {
            const shellGeometry = createShellGeometry(W_val, D_val, T_val);
            if (shellGeometry.attributes.position && shellGeometry.attributes.position.count > 0) {
                const shellMaterial = new THREE.MeshPhongMaterial({
                    // color: 0xAFEEEE, // PaleTurquoise
                    color: 0x20e69d,
                    shininess: 60,
                    side: THREE.DoubleSide
                });
                currentShellRef.current = new THREE.Mesh(shellGeometry, shellMaterial);
                scene.add(currentShellRef.current);
            }
        } catch (error) {
            console.error("Error creating shell geometry:", error);
        }
    };

    const handlePointerDown = (event: PointerEvent) => {
        if (!mountRef.current || !cameraRef.current || !raycasterRef.current || !pointerRef.current || !shellsGroupRef.current) return;

        const rect = mountRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        pointerRef.current.set(x, y);

        raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(shellsGroupRef.current.children, false);

        if (intersects.length > 0) {
            const firstIntersect = intersects[0].object;
            if (firstIntersect.userData && (firstIntersect.userData as MarkerUserData).isMarker) {
                const { W: markerW, D: markerD, T: markerT } = firstIntersect.userData as MarkerUserData;
                setW(markerW);
                setD(markerD);
                setT(markerT);
            }
        }
    };


    // Setup Effect
    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        sceneRef.current = new THREE.Scene();
        // sceneRef.current.background = new THREE.Color(0x18181B);
        sceneRef.current.background = new THREE.Color(0x000000);

        cameraRef.current = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        cameraRef.current.position.set(8, 7, 12);
        cameraRef.current.lookAt(0, 0, 0);

        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(rendererRef.current.domElement);

        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.1;
        controlsRef.current.target.set(0, 1, 0);

        const ambientLight = new THREE.AmbientLight(0xCCCCCC, 1.1);
        sceneRef.current.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.9);
        directionalLight.position.set(5, 10, 7.5);
        sceneRef.current.add(directionalLight);

        raycasterRef.current = new THREE.Raycaster();
        pointerRef.current = new THREE.Vector2();

        shellsGroupRef.current = populateMorphospace(sceneRef.current);

        updateVisualization(sceneRef.current, W, D, T);

        const animate = () => {
            // Store the id for cancellation
            animationFrameId.current = requestAnimationFrame(animate);

            // Update controls (needed for damping)
            controlsRef.current?.update();

            // *** READ FROM THE REF for rotation check ***
            if (autoRotateRef.current && sceneRef.current) {
                sceneRef.current.rotation.y += 0.003; // Rotate the whole scene
            }

            // Render the scene
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate(); // Start the loop

        const handleResize = () => {
            if (cameraRef.current && rendererRef.current && currentMount) {
                cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        currentMount.addEventListener('pointerdown', handlePointerDown);


        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeEventListener('pointerdown', handlePointerDown);
            }
            controlsRef.current?.dispose();
            // Safe disposal loop...
            sceneRef.current?.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else if (object.material) {
                        object.material.dispose();
                    }
                }
            });
            while ((sceneRef.current?.children as any).length > 0) {
                sceneRef.current?.remove(sceneRef.current.children[0]);
            }

            rendererRef.current?.dispose();
            if (rendererRef.current?.domElement && currentMount?.contains(rendererRef.current.domElement)) {
                currentMount?.removeChild(rendererRef.current.domElement);
            }
            // Nullify refs...
            rendererRef.current = null; sceneRef.current = null; cameraRef.current = null;
            controlsRef.current = null; currentShellRef.current = null; floatingMarkerRef.current = null;
            shellsGroupRef.current = null; raycasterRef.current = null; pointerRef.current = null;
            animationFrameId.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Setup effect still runs only once


    // Effect to update visualization when W, D, or T props change
    useEffect(() => {
        if (sceneRef.current) {
            updateVisualization(sceneRef.current, W, D, T);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [W, D, T]);


    // *** UPDATE AUTOROTATE REF WHEN PROP CHANGES ***
    useEffect(() => {
        autoRotateRef.current = autoRotate;
    }, [autoRotate]);


    return (
        <div
            ref={mountRef}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
        />
    );
};

export default Viewer;
