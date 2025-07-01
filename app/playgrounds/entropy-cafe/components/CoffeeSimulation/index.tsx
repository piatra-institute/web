'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ParticleSystem } from '../../logic/particleSystem';

interface CoffeeSimulationProps {
    onMetricsUpdate?: (entropy: number, complexity: number) => void;
}

export interface CoffeeSimulationRef {
    addCream: () => void;
    reset: () => void;
    setPaused: (paused: boolean) => void;
    setStirring: (stirring: boolean) => void;
}

const CoffeeSimulation = forwardRef<CoffeeSimulationRef, CoffeeSimulationProps>(
    ({ onMetricsUpdate }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const sceneRef = useRef<THREE.Scene | null>(null);
        const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
        const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
        const controlsRef = useRef<OrbitControls | null>(null);
        const particleSystemRef = useRef<ParticleSystem | null>(null);
        const animationIdRef = useRef<number | null>(null);

        useImperativeHandle(ref, () => ({
            addCream: () => {
                particleSystemRef.current?.addCream();
            },
            reset: () => {
                particleSystemRef.current?.reset();
            },
            setPaused: (paused: boolean) => {
                particleSystemRef.current?.setPaused(paused);
            },
            setStirring: (stirring: boolean) => {
                particleSystemRef.current?.setStirring(stirring);
            },
        }));

        useEffect(() => {
            const container = containerRef.current;
            if (!container) return;

            // Scene setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);
            sceneRef.current = scene;

            // Camera setup
            const camera = new THREE.PerspectiveCamera(
                75,
                container.clientWidth / container.clientHeight,
                0.1,
                1000
            );
            camera.position.set(0, 10, 15);
            cameraRef.current = camera;

            // Renderer setup
            const renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true,
                premultipliedAlpha: false,
            });
            renderer.setSize(container.clientWidth || 800, container.clientHeight || 600);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.sortObjects = true;
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            container.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(5, 10, 7.5);
            scene.add(directionalLight);

            // Controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.minDistance = 6;
            controls.maxDistance = 25;
            controls.target.set(0, 5, 0);
            controls.update();
            controlsRef.current = controls;

            // Create cup
            const cupGroup = createCup();
            scene.add(cupGroup);

            // Initialize particle system
            const particleSystem = new ParticleSystem(scene, onMetricsUpdate);
            particleSystemRef.current = particleSystem;

            // Handle resize
            const handleResize = () => {
                const width = container.clientWidth;
                const height = container.clientHeight;
                if (width > 0 && height > 0) {
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height);
                }
            };

            // Initial resize with small delay to ensure DOM is ready
            setTimeout(() => {
                handleResize();
            }, 100);

            // Animation loop
            const animate = () => {
                animationIdRef.current = requestAnimationFrame(animate);
                controls.update();
                particleSystem.update();
                renderer.render(scene, camera);
            };
            animate();

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
                }
                renderer.dispose();
                controls.dispose();
                container.removeChild(renderer.domElement);
            };
        }, [onMetricsUpdate]);

        const createCup = () => {
            const cupHeight = 10;
            const cupRadiusTop = 4;
            const cupRadiusBottom = 3;
            const cupMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
            });

            const cupGroup = new THREE.Group();
            cupGroup.position.y = cupHeight / 2;

            // Cup body
            const cupBodyGeometry = new THREE.CylinderGeometry(
                cupRadiusTop,
                cupRadiusBottom,
                cupHeight,
                64,
                1,
                true
            );
            const cupBody = new THREE.Mesh(cupBodyGeometry, cupMaterial);
            cupBody.renderOrder = 1;
            cupGroup.add(cupBody);

            // Cup bottom
            const cupBottomGeometry = new THREE.CircleGeometry(cupRadiusBottom, 64);
            const cupBottom = new THREE.Mesh(cupBottomGeometry, cupMaterial);
            cupBottom.position.y = -cupHeight / 2;
            cupBottom.rotation.x = -Math.PI / 2;
            cupBottom.renderOrder = 1;
            cupGroup.add(cupBottom);

            // Cup handle - create a half torus
            const handleRadius = 1.2;
            const handleTube = 0.3;
            const handleGeometry = new THREE.TorusGeometry(handleRadius, handleTube, 8, 16, Math.PI);
            const handle = new THREE.Mesh(handleGeometry, cupMaterial);
            // Position handle on the side of the cup
            handle.position.x = cupRadiusTop + handleRadius - handleTube - 1.3;
            handle.position.y = 1; // Slightly above center
            handle.rotation.z = -Math.PI / 2 + 0.1;
            handle.rotation.x = Math.PI;
            handle.renderOrder = 1;
            cupGroup.add(handle);

            // Saucer
            const saucerGeometry = new THREE.CylinderGeometry(
                cupRadiusTop * 1.5,
                cupRadiusTop * 1.4,
                0.5,
                64
            );
            const saucer = new THREE.Mesh(saucerGeometry, cupMaterial);
            saucer.position.y = -cupHeight / 2;
            saucer.renderOrder = 1;
            cupGroup.add(saucer);

            return cupGroup;
        };

        return (
            <div
                ref={containerRef}
                className="w-full h-screen relative"
                style={{ cursor: 'grab' }}
            />
        );
    }
);

CoffeeSimulation.displayName = 'CoffeeSimulation';

export default CoffeeSimulation;