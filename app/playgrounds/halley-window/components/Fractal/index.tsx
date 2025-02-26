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
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // WebGL shader for Halley's method fractal
    const createShaders = useCallback((gl: WebGLRenderingContext) => {
        // Vertex shader - transforms coordinates
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Fragment shader - calculates the fractal color for each pixel
        const fragmentShaderSource = `
            precision highp float;
            
            uniform float u_width;
            uniform float u_height;
            uniform float u_centerX;
            uniform float u_centerY;
            uniform float u_zoom;
            uniform float u_maxIterations;
            uniform float u_bailout;
            uniform float u_constant;
            uniform float u_polynomialDegree;
            uniform int u_colorMode;
            
            // Complex number operations
            vec2 complex_add(vec2 a, vec2 b) {
                return vec2(a.x + b.x, a.y + b.y);
            }
            
            vec2 complex_sub(vec2 a, vec2 b) {
                return vec2(a.x - b.x, a.y - b.y);
            }
            
            vec2 complex_mul(vec2 a, vec2 b) {
                return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
            }
            
            vec2 complex_div(vec2 a, vec2 b) {
                float denominator = b.x * b.x + b.y * b.y;
                return vec2(
                    (a.x * b.x + a.y * b.y) / denominator,
                    (a.y * b.x - a.x * b.y) / denominator
                );
            }
            
            float complex_abs(vec2 z) {
                return sqrt(z.x * z.x + z.y * z.y);
            }
            
            // Raise complex number to integer power
            vec2 complex_pow(vec2 z, float n) {
                // Handle common cases directly for performance
                if (n == 0.0) return vec2(1.0, 0.0);
                if (n == 1.0) return z;
                if (n == 2.0) return complex_mul(z, z);
                if (n == 3.0) return complex_mul(complex_mul(z, z), z);
                
                // For higher powers, use polar form
                float r = complex_abs(z);
                float theta = atan(z.y, z.x);
                float newR = pow(r, n);
                float newTheta = theta * n;
                return vec2(newR * cos(newTheta), newR * sin(newTheta));
            }
            
            // Polynomial function f(z) = z^n - 1
            vec2 f(vec2 z, float n) {
                return complex_sub(complex_pow(z, n), vec2(1.0, 0.0));
            }
            
            // Derivative f'(z) = n * z^(n-1)
            vec2 f_prime(vec2 z, float n) {
                return complex_mul(vec2(n, 0.0), complex_pow(z, n - 1.0));
            }
            
            // Second derivative f''(z) = n * (n-1) * z^(n-2)
            vec2 f_double_prime(vec2 z, float n) {
                return complex_mul(
                    vec2(n * (n - 1.0), 0.0),
                    complex_pow(z, n - 2.0)
                );
            }
            
            // Halley's method iteration
            vec2 halley_iteration(vec2 z, float n, float c) {
                vec2 fz = f(z, n);
                vec2 fpz = f_prime(z, n);
                vec2 fppz = f_double_prime(z, n);
                
                vec2 numerator = complex_mul(vec2(2.0, 0.0), complex_mul(fz, fpz));
                
                vec2 fpz2 = complex_mul(fpz, fpz);
                vec2 term2 = complex_mul(complex_mul(fz, fppz), vec2(c, 0.0));
                vec2 denominator = complex_sub(complex_mul(vec2(2.0, 0.0), fpz2), term2);
                
                vec2 fraction = complex_div(numerator, denominator);
                return complex_sub(z, fraction);
            }
            
            // Convert HSL to RGB
            vec3 hsl_to_rgb(float h, float s, float l) {
                float c = (1.0 - abs(2.0 * l - 1.0)) * s;
                float x = c * (1.0 - abs(mod(h / 60.0, 2.0) - 1.0));
                float m = l - c / 2.0;
                
                vec3 rgb;
                if (h < 60.0) {
                    rgb = vec3(c, x, 0.0);
                } else if (h < 120.0) {
                    rgb = vec3(x, c, 0.0);
                } else if (h < 180.0) {
                    rgb = vec3(0.0, c, x);
                } else if (h < 240.0) {
                    rgb = vec3(0.0, x, c);
                } else if (h < 300.0) {
                    rgb = vec3(x, 0.0, c);
                } else {
                    rgb = vec3(c, 0.0, x);
                }
                
                return rgb + m;
            }
            
            void main() {
                // Map pixel coordinates to complex plane
                float aspectRatio = u_width / u_height;
                float scale = 4.0 / u_zoom;
                
                vec2 z = vec2(
                    (gl_FragCoord.x / u_width - 0.5) * scale * aspectRatio + u_centerX,
                    (gl_FragCoord.y / u_height - 0.5) * scale + u_centerY
                );
                
                float iteration = 0.0;
                bool escaped = false;
                
                // Apply Halley's method iterations
                for (float i = 0.0; i < 1000.0; i++) {
                    if (i >= u_maxIterations) break;
                    
                    z = halley_iteration(z, u_polynomialDegree, u_constant);
                    
                    // Check if escaped or converged
                    float abs_z = complex_abs(z);
                    if (abs_z > u_bailout || abs_z != abs_z) { // NaN check
                        escaped = true;
                        iteration = i;
                        break;
                    }
                    
                    // Check for convergence to a root
                    vec2 fz = f(z, u_polynomialDegree);
                    if (complex_abs(fz) < 0.000001) {
                        iteration = i;
                        break;
                    }
                    
                    // Avoid numerical instability
                    if (abs(z.x) > 1e10 || abs(z.y) > 1e10) {
                        escaped = true;
                        iteration = i;
                        break;
                    }
                    
                    iteration = i + 1.0;
                }
                
                // Calculate color
                vec3 color;
                float t = iteration / u_maxIterations;
                
                if (u_colorMode == 0) { // HSL
                    float hue = mod(t * 360.0 * 2.0, 360.0);
                    float saturation = escaped ? 1.0 : 0.0;
                    float lightness = escaped ? 0.5 : (iteration == u_maxIterations ? 0.0 : 0.9);
                    
                    color = hsl_to_rgb(hue, saturation, lightness);
                } else { // RGB
                    if (escaped) {
                        // Enhanced RGB coloring
                        color.r = sin(t * 3.14159265 * 3.0) * 0.5 + 0.5;
                        color.g = sin(t * 3.14159265 * 3.0 + 2.1) * 0.5 + 0.5;
                        color.b = sin(t * 3.14159265 * 3.0 + 4.2) * 0.5 + 0.5;
                        
                        // Boost contrast
                        color = clamp(color * 1.2, 0.0, 1.0);
                    } else {
                        // Dark blue for non-escaped points
                        color = vec3(0.0, 0.0, 0.08);
                    }
                }
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        // Create and compile vertex shader
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (!vertexShader) return null;
        
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
            gl.deleteShader(vertexShader);
            return null;
        }
        
        // Create and compile fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fragmentShader) return null;
        
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            return null;
        }
        
        // Create and link program
        const program = gl.createProgram();
        if (!program) return null;
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking failed:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            return null;
        }
        
        return program;
    }, []);
    
    // Setup the WebGL context and render the fractal
    const setupGL = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Get or create WebGL context
        let gl = glRef.current;
        if (!gl) {
            gl = canvas.getContext('webgl');
            if (!gl) {
                console.error('WebGL not supported');
                return;
            }
            glRef.current = gl;
        }
        
        // Create shader program if not already created
        let program = programRef.current;
        if (!program) {
            program = createShaders(gl);
            if (!program) return;
            programRef.current = program;
        }
        
        // Set program and viewport
        gl.useProgram(program);
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        // Create a simple full-screen quad
        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]);
        
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        
        // Set attributes
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Set uniforms
        gl.uniform1f(gl.getUniformLocation(program, 'u_width'), canvas.width);
        gl.uniform1f(gl.getUniformLocation(program, 'u_height'), canvas.height);
        gl.uniform1f(gl.getUniformLocation(program, 'u_centerX'), centerX);
        gl.uniform1f(gl.getUniformLocation(program, 'u_centerY'), centerY);
        gl.uniform1f(gl.getUniformLocation(program, 'u_zoom'), zoom);
        gl.uniform1f(gl.getUniformLocation(program, 'u_maxIterations'), maxIterations);
        gl.uniform1f(gl.getUniformLocation(program, 'u_bailout'), bailout);
        gl.uniform1f(gl.getUniformLocation(program, 'u_constant'), constant);
        gl.uniform1f(gl.getUniformLocation(program, 'u_polynomialDegree'), polynomialDegree);
        gl.uniform1i(gl.getUniformLocation(program, 'u_colorMode'), colorMode === 'hsl' ? 0 : 1);
        
        // Draw
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, [centerX, centerY, zoom, maxIterations, bailout, constant, polynomialDegree, colorMode, createShaders]);
    
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
        const aspectRatio = canvas.width / canvas.height;
        const offsetX = dx * scale * aspectRatio / canvas.width;
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
            setupGL();
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [setupGL]);
    
    // Render fractal when parameters change
    useEffect(() => {
        setupGL();
    }, [setupGL]);
    
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