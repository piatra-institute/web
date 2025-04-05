'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



function createShellGeometry(W: number, D: number, T: number): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];

    // --- Adjust W Sensitivity ---
    const wSensitivityExponent = 0.7; // TUNABLE: Lower value (e.g., 0.5) => less sensitive at low W. Higher (e.g., 0.9) => more sensitive.
    const W_effective = Math.max(1.0, Math.pow(W, wSensitivityExponent)); // Ensure effective W doesn't drop below 1 due to exponent

    // --- Simpler 'a' ---
    const initial_a = 0.5; // Constant base radius (can be tuned if needed)
    const a = initial_a;
    // const a = initial_a / Math.max(1, W * 0.1); // Optional: Keep a slight inverse relation if needed

    // Use W_effective in log
    const b = Math.log(W_effective) / (2 * Math.PI);

    const numPoints = 400;
    // Keep maxTheta calculation as it helps control overall turns
    const maxTheta = (4 + 8 / Math.sqrt(W)) * Math.PI;

    for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * maxTheta;
        const r = a * Math.exp(b * theta);
        // Use original Z calculation (sensitive T was not the primary issue)
        points.push(new THREE.Vector3(
            r * Math.cos(theta),
            r * Math.sin(theta),
            T * r * theta / (2 * Math.PI)
        ));
    }

    // Rest of the function (checks, normalization, tube creation) remains the same...
    if (points.length < 2) { return new THREE.BufferGeometry(); }
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

    // --- Helper Functions for Keyboard Navigation (Memoized) ---
    const findNearestMarker = useCallback((currentW: number, currentD: number, currentT: number): THREE.Object3D | null => {
        const markers = shellsGroupRef.current?.children;
        if (!markers || markers.length === 0) return null;
        let nearestMarker: THREE.Object3D | null = null;
        let minDistanceSq = Infinity;
        for (const marker of markers) {
            const data = marker.userData as MarkerUserData;
            if (!data?.isMarker) continue;
            const distSq = Math.pow(data.W - currentW, 2) + Math.pow(data.D - currentD, 2) + Math.pow(data.T - currentT, 2);
            if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                nearestMarker = marker;
            }
        }
        return nearestMarker;
    }, []); // Reads ref, no deps needed

    const findNextMarkerInDirection = useCallback((startMarkerData: MarkerUserData, direction: 'left' | 'right' | 'upD' | 'downD' | 'upT' | 'downT'): MarkerUserData | null => {
        const markers = shellsGroupRef.current?.children;
        if (!markers) return null;
        const { W: startW, D: startD, T: startT } = startMarkerData;
        let bestCandidate: MarkerUserData | null = null;
        const epsilon = 0.001;
        for (const marker of markers) {
            const data = marker.userData as MarkerUserData;
            if (!data?.isMarker) continue;
            let isCandidate = false;
            let isBetterCandidate = false;
            switch (direction) {
                case 'left':
                    if (Math.abs(data.D - startD) < epsilon && Math.abs(data.T - startT) < epsilon && data.W < startW - epsilon) {
                        isCandidate = true; if (!bestCandidate || data.W > bestCandidate.W) isBetterCandidate = true;
                    } break;
                case 'right':
                    if (Math.abs(data.D - startD) < epsilon && Math.abs(data.T - startT) < epsilon && data.W > startW + epsilon) {
                        isCandidate = true; if (!bestCandidate || data.W < bestCandidate.W) isBetterCandidate = true;
                    } break;
                case 'downD':
                    if (Math.abs(data.W - startW) < epsilon && Math.abs(data.T - startT) < epsilon && data.D < startD - epsilon) {
                        isCandidate = true; if (!bestCandidate || data.D > bestCandidate.D) isBetterCandidate = true;
                    } break;
                case 'upD':
                    if (Math.abs(data.W - startW) < epsilon && Math.abs(data.T - startT) < epsilon && data.D > startD + epsilon) {
                        isCandidate = true; if (!bestCandidate || data.D < bestCandidate.D) isBetterCandidate = true;
                    } break;
                case 'downT':
                    if (Math.abs(data.W - startW) < epsilon && Math.abs(data.D - startD) < epsilon && data.T < startT - epsilon) {
                        isCandidate = true; if (!bestCandidate || data.T > bestCandidate.T) isBetterCandidate = true;
                    } break;
                case 'upT':
                    if (Math.abs(data.W - startW) < epsilon && Math.abs(data.D - startD) < epsilon && data.T > startT + epsilon) {
                        isCandidate = true; if (!bestCandidate || data.T < bestCandidate.T) isBetterCandidate = true;
                    } break;
            }
            if (isCandidate && isBetterCandidate) bestCandidate = data;
        }
        return bestCandidate;
    }, []); // Reads ref, no deps needed


    // --- Keyboard Navigation Handler (Memoized) ---
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

        // Use props directly here as useCallback ensures they are current
        const startMarker = findNearestMarker(W, D, T);
        if (!startMarker?.userData) return;

        let direction: 'left' | 'right' | 'upD' | 'downD' | 'upT' | 'downT' | null = null;
        if (event.shiftKey) {
            if (event.key === 'ArrowUp') direction = 'upT';
            else if (event.key === 'ArrowDown') direction = 'downT';
        } else {
            if (event.key === 'ArrowLeft') direction = 'left';
            else if (event.key === 'ArrowRight') direction = 'right';
            else if (event.key === 'ArrowUp') direction = 'upD';
            else if (event.key === 'ArrowDown') direction = 'downD';
        }

        if (direction) {
            const targetMarkerData = findNextMarkerInDirection(startMarker.userData as MarkerUserData, direction);
            if (targetMarkerData) {
                event.preventDefault();
                setW(targetMarkerData.W);
                setD(targetMarkerData.D);
                setT(targetMarkerData.T);
            }
        }
    }, [W, D, T, setW, setD, setT, findNearestMarker, findNextMarkerInDirection]); // Correct dependencies


    const populateMorphospace = (scene: THREE.Scene): THREE.Group => {
        const group = new THREE.Group(); const markerGeom = new THREE.SphereGeometry(0.07, 12, 12); const markerMat = new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.7, metalness: 0.5 });
        const wStep = 0.2; const dStep = 0.1; const tStep = 0.2;
        for (let wVal = 1; wVal <= 5; wVal += wStep) { wVal = parseFloat(wVal.toFixed(2));
            for (let dVal = 0.1; dVal <= 1.0; dVal += dStep) { dVal = parseFloat(dVal.toFixed(2));
                for (let tVal = 0; tVal <= 3; tVal += tStep) { tVal = parseFloat(tVal.toFixed(2));
                    const marker = new THREE.Mesh(markerGeom.clone(), markerMat.clone()); marker.position.set(wVal, dVal * 5, tVal); marker.userData = { W: wVal, D: dVal, T: tVal, isMarker: true } as MarkerUserData; group.add(marker);
                }
            }
        } console.log(`Populated morphospace with ${group.children.length} markers.`); scene.add(group); return group;
    };
    const updateVisualization = (scene: THREE.Scene, W_val: number, D_val: number, T_val: number) => {
        // Update floating marker position
        if (floatingMarkerRef.current) {
            floatingMarkerRef.current.position.set(W_val, D_val * 5, T_val);
        } else {
            const markerGeom = new THREE.SphereGeometry(0.15, 16, 16);
            const markerMat = new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.7, metalness: 0.5 }); // LightGreen
            floatingMarkerRef.current = new THREE.Mesh(markerGeom, markerMat);
            floatingMarkerRef.current.position.set(W_val, D_val * 5, T_val);
            scene.add(floatingMarkerRef.current);
        }
        if (currentShellRef.current) {
            scene.remove(currentShellRef.current);
            currentShellRef.current.geometry.dispose();
            if (Array.isArray(currentShellRef.current.material)) {
                currentShellRef.current.material.forEach(m => m.dispose());
            } else if (currentShellRef.current.material) {
                currentShellRef.current.material.dispose();
            }
            currentShellRef.current = null;
        }
        try {
            const shellGeometry = createShellGeometry(W_val, D_val, T_val);
            if (shellGeometry.attributes.position && shellGeometry.attributes.position.count > 0) {
                const shellMaterial = new THREE.MeshPhongMaterial({ color: 0x20e69d, shininess: 60, side: THREE.DoubleSide });
                currentShellRef.current = new THREE.Mesh(shellGeometry, shellMaterial);
                scene.add(currentShellRef.current);
            }
        } catch (error) { console.error("Error creating shell geometry:", error); }
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
                setW(markerW); setD(markerD); setT(markerT);
            }
        }
    };


    // --- Setup Effect (Runs ONCE) ---
    useEffect(() => {
        if (!mountRef.current) {
            return;
        }
        const currentMount = mountRef.current;

        // Initialize Three.js Scene, Camera, Renderer, Controls, Lights, Markers
        sceneRef.current = new THREE.Scene();
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

        // Use props directly for initial visualization
        updateVisualization(sceneRef.current, W, D, T);

        // Animation loop
        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate);
            controlsRef.current?.update();
            if (autoRotateRef.current && sceneRef.current) { // Use ref here
                sceneRef.current.rotation.y += 0.003;
            }
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        // Resize listener
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current && currentMount) {
                cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        // PointerDown listener
        currentMount.addEventListener('pointerdown', handlePointerDown);


        // Cleanup function for setup effect
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('resize', handleResize);
            if (currentMount) currentMount.removeEventListener('pointerdown', handlePointerDown); // Remove from mountRef

            // Dispose logic...
            controlsRef.current?.dispose();
            sceneRef.current?.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
                    else if (object.material) object.material.dispose();
                }
            });
            while (sceneRef.current?.children.length) sceneRef.current.remove(sceneRef.current.children[0]);
            rendererRef.current?.dispose();
            if (rendererRef.current?.domElement && currentMount?.contains(rendererRef.current.domElement)) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            // Nullify refs...
            rendererRef.current = null; sceneRef.current = null; cameraRef.current = null;
            controlsRef.current = null; currentShellRef.current = null; floatingMarkerRef.current = null;
            shellsGroupRef.current = null; raycasterRef.current = null; pointerRef.current = null;
            animationFrameId.current = null;
        };
        // ** CRITICAL: Empty dependency array ensures this runs only once **
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // --- Effect for managing Keyboard Listener ---
    useEffect(() => {
        // Add listener using the memoized handler
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function for *this specific effect*
        return () => {
            console.log("Removing keydown listener"); // Debugging
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]); // Re-attach listener ONLY if handleKeyDown function identity changes


    // Effect to update visualization when W, D, or T props change
    useEffect(() => {
        // Only run update if scene exists (avoids errors during initial render/cleanup)
        if (sceneRef.current) {
            console.log("Updating visualization due to W, D, T change"); // Debugging
            updateVisualization(sceneRef.current, W, D, T);
        }
    }, [W, D, T]); // Correct dependencies


    // Effect for autoRotate prop changes
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
