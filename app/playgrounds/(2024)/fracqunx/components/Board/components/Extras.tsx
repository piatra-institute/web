import React from 'react';

import * as THREE from 'three';

import {
    wallColor,
} from '../data';



export function GaussianCurve() {
    return (
        <mesh
            position={[0, -2.5, -0.15]}
        >
            <tubeGeometry
                args={[
                    new THREE.CatmullRomCurve3(
                        Array.from({ length: 50 }, (_, i) => {
                            const x = (i - 25) / 12.5;  // Range from -5 to 5
                            // Gaussian function: f(x) = a * e^(-(x-b)²/(2c²))
                            const y = 2.2 * Math.exp(-(x * x) / 1.6);  // a=2, b=0, c=1
                            return new THREE.Vector3(x, y, 0);
                        })
                    ),
                    64,     // tubular segments
                    0.01,    // radius
                    8,      // radial segments
                    false   // closed
                ]}
            />
            <meshStandardMaterial color={wallColor} />
        </mesh>
    );
}
