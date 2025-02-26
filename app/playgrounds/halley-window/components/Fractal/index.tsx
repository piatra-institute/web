'use client';

import {
    useState,
    useRef,
    useEffect,
    useCallback,
} from 'react';

interface FractalProps {
    constant: number;
    centerX: number;
    centerY: number;
    setCenterX: (value: number) => void;
    setCenterY: (value: number) => void;
    zoom: number;
    setZoom: (value: number) => void;
    maxIterations: number;
    bailout: number;
    colorMode: 'hsl' | 'rgb';
    polynomialDegree: number;
}

export default function Fractal({
    constant,
    centerX,
    centerY,
    setCenterX,
    setCenterY,
    zoom,
    setZoom,
    maxIterations,
    bailout,
    colorMode,
    polynomialDegree,
}: FractalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Complex number operations
    const complexAdd = (a: [number, number], b: [number, number]): [number, number] => {
        return [a[0] + b[0], a[1] + b[1]];
    };
    
    const complexSub = (a: [number, number], b: [number, number]): [number, number] => {
        return [a[0] - b[0], a[1] - b[1]];
    };
    
    const complexMul = (a: [number, number], b: [number, number]): [number, number] => {
        return [
            a[0] * b[0] - a[1] * b[1],
            a[0] * b[1] + a[1] * b[0]
        ];
    };
    
    const complexDiv = (a: [number, number], b: [number, number]): [number, number] => {
        const denominator = b[0] * b[0] + b[1] * b[1];
        return [
            (a[0] * b[0] + a[1] * b[1]) / denominator,
            (a[1] * b[0] - a[0] * b[1]) / denominator
        ];
    };
    
    const complexPow = (z: [number, number], n: number): [number, number] => {
        if (n === 0) return [1, 0];
        if (n === 1) return z;
        
        const half = Math.floor(n / 2);
        const halfPow = complexPow(z, half);
        const result = complexMul(halfPow, halfPow);
        
        if (n % 2 === 0) {
            return result;
        } else {
            return complexMul(result, z);
        }
    };
    
    const complexAbs = (z: [number, number]): number => {
        return Math.sqrt(z[0] * z[0] + z[1] * z[1]);
    };
    
    // Polynomial function f(z) = z^n - 1
    const f = (z: [number, number]): [number, number] => {
        return complexSub(complexPow(z, polynomialDegree), [1, 0]);
    };
    
    // Derivative f'(z) = n * z^(n-1)
    const fPrime = (z: [number, number]): [number, number] => {
        return complexMul([polynomialDegree, 0], complexPow(z, polynomialDegree - 1));
    };
    
    // Second derivative f''(z) = n * (n-1) * z^(n-2)
    const fDoublePrime = (z: [number, number]): [number, number] => {
        return complexMul(
            [polynomialDegree * (polynomialDegree - 1), 0], 
            complexPow(z, polynomialDegree - 2)
        );
    };
    
    // Halley's method iteration
    // z_{n+1} = z_n - (2 * f(z_n) * f'(z_n)) / (2 * f'(z_n)^2 - f(z_n) * f''(z_n) * c)
    // where c is a constant parameter (default: 1)
    const halleyIteration = (z: [number, number]): [number, number] => {
        const fz = f(z);
        const fpz = fPrime(z);
        const fppz = fDoublePrime(z);
        
        const numerator = complexMul([2, 0], complexMul(fz, fpz));
        
        const fpz2 = complexMul(fpz, fpz);
        const term2 = complexMul(complexMul(fz, fppz), [constant, 0]);
        const denominator = complexSub(complexMul([2, 0], fpz2), term2);
        
        const fraction = complexDiv(numerator, denominator);
        return complexSub(z, fraction);
    };
    
    // Render the fractal with optimized computation
    const renderFractal = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Get dimensions
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
        
        // Create image data
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        // Adaptive sampling for faster initial rendering
        // Start with larger blocks and then refine
        const initialPixelSize = 4; // Start with larger blocks for fast preview
        const finalPixelSize = 1;   // Final render quality
        const scale = 4 / zoom;
        const offsetX = centerX;
        const offsetY = centerY;
        
        let currentPixelSize = initialPixelSize;
        let refineStage = 0;
        
        // Use a requestAnimationFrame to prevent UI freeze
        const renderChunk = (startY: number) => {
            const endY = Math.min(startY + 30, height); // Process more rows at a time for speed
            
            for (let y = startY; y < endY; y += currentPixelSize) {
                for (let x = 0; x < width; x += currentPixelSize) {
                    // Map pixel coordinates to complex plane
                    const zx = (x - width / 2) * scale / width + offsetX;
                    const zy = (y - height / 2) * scale / height + offsetY;
                    
                    let z: [number, number] = [zx, zy];
                    let iteration = 0;
                    let escaped = false;
                    
                    // Apply Halley's method iterations with early break to prevent infinite loop
                    while (iteration < maxIterations) {
                        // Try-catch to handle potential division by zero or other numerical issues
                        try {
                            z = halleyIteration(z);
                            
                            // Check if the point has escaped or converged
                            const abs = complexAbs(z);
                            if (abs > bailout || isNaN(abs)) {
                                escaped = true;
                                break;
                            }
                            
                            // Check for convergence to a root
                            const fz = f(z);
                            if (complexAbs(fz) < 1e-6) {
                                break;
                            }
                            
                            // Avoid infinite loops if the iterations aren't changing z anymore
                            if (iteration > 0 && Math.abs(z[0]) > 1e10 || Math.abs(z[1]) > 1e10) {
                                escaped = true;
                                break;
                            }
                            
                            iteration++;
                        } catch (e) {
                            escaped = true;
                            break;
                        }
                    }
                    
                    // Calculate color based on iterations
                    let r, g, b;
                    
                    if (colorMode === 'hsl') {
                        // HSL coloring - enhanced for better visual impact
                        const hue = (iteration / maxIterations * 360 * 2) % 360; // Double the hue range for more variation
                        const saturation = escaped ? 100 : 0;
                        const lightness = escaped ? 50 : iteration === maxIterations ? 0 : 90; // Slightly less bright whites
                        
                        // Convert HSL to RGB
                        const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
                        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                        const m = lightness / 100 - c / 2;
                        
                        let r1, g1, b1;
                        
                        if (hue < 60) {
                            [r1, g1, b1] = [c, x, 0];
                        } else if (hue < 120) {
                            [r1, g1, b1] = [x, c, 0];
                        } else if (hue < 180) {
                            [r1, g1, b1] = [0, c, x];
                        } else if (hue < 240) {
                            [r1, g1, b1] = [0, x, c];
                        } else if (hue < 300) {
                            [r1, g1, b1] = [x, 0, c];
                        } else {
                            [r1, g1, b1] = [c, 0, x];
                        }
                        
                        r = Math.round((r1 + m) * 255);
                        g = Math.round((g1 + m) * 255);
                        b = Math.round((b1 + m) * 255);
                    } else {
                        // RGB coloring - styled to match reference image
                        const t = iteration / maxIterations;
                        
                        if (escaped) {
                            // Use a more striking, saturated color palette
                            r = Math.round(Math.sin(t * Math.PI * 3) * 127 + 128);
                            g = Math.round(Math.sin(t * Math.PI * 3 + 2.1) * 127 + 128);
                            b = Math.round(Math.sin(t * Math.PI * 3 + 4.2) * 127 + 128);
                            
                            // Boost contrast
                            r = Math.min(255, Math.max(0, r * 1.2));
                            g = Math.min(255, Math.max(0, g * 1.2));
                            b = Math.min(255, Math.max(0, b * 1.2));
                        } else {
                            // Use dark blue for convergent points instead of black
                            r = 0;
                            g = 0;
                            b = 20;
                        }
                    }
                    
                    // Fill the pixel block with the color
                    for (let blockY = 0; blockY < currentPixelSize && y + blockY < height; blockY++) {
                        for (let blockX = 0; blockX < currentPixelSize && x + blockX < width; blockX++) {
                            const i = ((y + blockY) * width + (x + blockX)) * 4;
                            data[i] = r;
                            data[i + 1] = g;
                            data[i + 2] = b;
                            data[i + 3] = 255;
                        }
                    }
                }
            }
            
            // Update the canvas with the current chunk
            ctx.putImageData(imageData, 0, 0);
            
            // Continue with the next chunk or refine
            if (endY < height) {
                requestAnimationFrame(() => renderChunk(endY));
            } else if (currentPixelSize > finalPixelSize) {
                // Refine the image with smaller pixel size
                refineStage++;
                currentPixelSize = Math.max(finalPixelSize, initialPixelSize / (2 * refineStage));
                requestAnimationFrame(() => renderChunk(0));
            }
        };
        
        // Start rendering from the top of the canvas
        renderChunk(0);
    }, [centerX, centerY, zoom, maxIterations, bailout, constant, colorMode, polynomialDegree]);
    
    // Handle mouse events for panning
    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };
    
    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        const scale = 4 / zoom;
        const offsetX = dx * scale / canvas.width;
        const offsetY = dy * scale / canvas.height;
        
        // Update center coordinates based on drag
        setCenterX(centerX - offsetX);
        setCenterY(centerY - offsetY);
        
        // Update drag start position
        setDragStart({ x: e.clientX, y: e.clientY });
    };
    
    const onMouseUp = () => {
        setIsDragging(false);
    };
    
    // Handle wheel events for zooming
    const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(zoom * zoomFactor);
    };
    
    // Resize canvas to window and render fractal
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            renderFractal();
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [renderFractal]);
    
    // Render fractal when parameters change
    useEffect(() => {
        renderFractal();
    }, [renderFractal]);
    
    return (
        <canvas
            ref={canvasRef}
            className="cursor-move"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
        />
    );
}