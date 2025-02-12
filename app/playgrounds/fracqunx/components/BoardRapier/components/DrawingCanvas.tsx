import React, { useState, useRef, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';



interface DrawingMaterialUniforms {
    [uniform: string]: THREE.IUniform<any>;
    drawingTexture: THREE.IUniform<THREE.Texture | null>;
    backgroundColor: THREE.IUniform<THREE.Color>;
    backgroundOpacity: THREE.IUniform<number>;
}

interface DrawingMaterial extends THREE.ShaderMaterial {
    uniforms: DrawingMaterialUniforms;
}

interface DrawingMesh extends THREE.Mesh {
    material: DrawingMaterial;
}

interface DrawingCanvasProps {
    width?: number;
    height?: number;
    position?: [number, number, number];
    onCurveCreated?: (curve: THREE.CatmullRomCurve3) => void;
    drawingCurve: boolean;
    setDrawingCurve: (drawing: boolean) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    width = 5,
    height = 5,
    position = [0, 0, 0.1],
    onCurveCreated,
    drawingCurve,
    setDrawingCurve,
}) => {
    const drawingRef = useRef<DrawingMesh>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const [drawingTexture] = useState<THREE.CanvasTexture>(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to get 2D context');
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.premultiplyAlpha = true;
        return texture;
    });

    const clearCanvas = useCallback(() => {
        if (!drawingRef.current) return;
        const canvas = drawingRef.current.material.uniforms.drawingTexture.value?.image as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        if (drawingRef.current.material.uniforms.drawingTexture.value) {
            drawingRef.current.material.uniforms.drawingTexture.value.needsUpdate = true;
        }
    }, []);

    const getWorldCoordinates = useCallback((event: ThreeEvent<PointerEvent>) => {
        if (!drawingRef.current) return null;
        const planeIntersectPoint = event.point;
        return drawingRef.current.worldToLocal(planeIntersectPoint.clone());
    }, []);

    const startDrawing = useCallback((event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setIsDrawing(true);
        setDrawingCurve(true);
        setPoints([]);
        setIsVisible(true);

        const worldPos = getWorldCoordinates(event);
        if (!worldPos) return;

        setPoints([worldPos]);

        if (!drawingRef.current) return;
        const canvas = drawingRef.current.material.uniforms.drawingTexture.value?.image as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        if (!context) return;

        clearCanvas();

        context.beginPath();
        const canvasX = ((worldPos.x + width / 2) / width) * canvas.width;
        const canvasY = ((1 - (worldPos.y + height / 2) / height)) * canvas.height;
        context.moveTo(canvasX, canvasY);
    }, [width, height, getWorldCoordinates, clearCanvas, setDrawingCurve]);

    const draw = useCallback((event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        if (!isDrawing || !drawingRef.current) return;

        const worldPos = getWorldCoordinates(event);
        if (!worldPos) return;

        setPoints(prev => [...prev, worldPos]);

        const canvas = drawingRef.current.material.uniforms.drawingTexture.value?.image as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        if (!context) return;

        const canvasX = ((worldPos.x + width / 2) / width) * canvas.width;
        const canvasY = ((1 - (worldPos.y + height / 2) / height)) * canvas.height;
        context.lineTo(canvasX, canvasY);
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.lineWidth = 6;
        context.stroke();

        if (drawingRef.current.material.uniforms.drawingTexture.value) {
            drawingRef.current.material.uniforms.drawingTexture.value.needsUpdate = true;
        }
    }, [isDrawing, width, height, getWorldCoordinates]);

    const stopDrawing = useCallback((event: ThreeEvent<PointerEvent>): void => {
        event.stopPropagation();
        setIsDrawing(false);
        setDrawingCurve(false);

        if (points.length > 1 && onCurveCreated) {
            const sampledPoints = samplePoints(points, 50);
            const curve = new THREE.CatmullRomCurve3(sampledPoints);
            onCurveCreated(curve);
            setIsVisible(false);
        }
    }, [points, onCurveCreated, setDrawingCurve]);

    const samplePoints = (points: THREE.Vector3[], numSamples: number) => {
        if (points.length <= numSamples) return points;

        const sampledPoints: THREE.Vector3[] = [];
        const step = (points.length - 1) / (numSamples - 1);

        for (let i = 0; i < numSamples; i++) {
            const index = Math.min(Math.floor(i * step), points.length - 1);
            sampledPoints.push(points[index].clone());
        }

        return sampledPoints;
    };

    if (!isVisible) return null;

    return (
        <Plane
            ref={drawingRef}
            args={[width, height]}
            position={position}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
        >
            <shaderMaterial
                attach="material"
                uniforms={{
                    drawingTexture: { value: drawingTexture },
                    backgroundColor: { value: new THREE.Color(0xffffff) },
                    backgroundOpacity: { value: 0.5 }
                }}
                vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
                fragmentShader={`
          uniform sampler2D drawingTexture;
          uniform vec3 backgroundColor;
          uniform float backgroundOpacity;
          varying vec2 vUv;
          void main() {
            vec4 texColor = texture2D(drawingTexture, vUv);
            float alpha = texColor.r == 1.0 && texColor.g == 1.0 && texColor.b == 1.0
              ? backgroundOpacity
              : 1.0;
            gl_FragColor = vec4(texColor.rgb, alpha);
          }
        `}
                transparent
                depthWrite={false}
            />
        </Plane>
    );
};


export default DrawingCanvas;
