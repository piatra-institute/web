export const fluidVertexShader = `
    attribute float size;
    attribute vec3 customColor;
    
    varying vec3 vColor;
    varying float vDepth;
    varying float vSize;
    
    void main() {
        vColor = customColor;
        vSize = size;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size based on distance for perspective
        gl_PointSize = size * (300.0 / -mvPosition.z);
        
        // Pass depth for soft particles
        vDepth = -mvPosition.z;
    }
`;

export const fluidFragmentShader = `
    uniform float opacity;
    
    varying vec3 vColor;
    varying float vDepth;
    varying float vSize;
    
    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) discard;
        
        // Smooth circular gradient
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha = pow(alpha, 1.5); // Adjust falloff
        
        // Apply color
        vec3 finalColor = vColor;
        
        // Subtle color variation
        float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        finalColor *= 0.95 + 0.05 * noise;
        
        // Final alpha with opacity
        alpha *= opacity;
        
        gl_FragColor = vec4(finalColor, alpha);
    }
`;