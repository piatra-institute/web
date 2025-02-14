import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BeadData, PegData } from "../data";



export interface AdaptiveCurveParams {
    xMin: number;
    xMax: number;
    influenceRadius?: number;
    stressFactor?: number; // scales stress into desired speed adjustments
    baseAoeSize?: number; // baseline AoE size when stress is zero
    sizeScale?: number; // how much AoE size changes with stress magnitude
    damping?: number; // rate at which peg parameters update toward the desired value
    maxAoeSize?: number; // maximum allowed AoE size
}

const DEFAULT_INFLUENCE_RADIUS = 1;
const DEFAULT_STRESS_FACTOR = 0.1;
const DEFAULT_BASE_AOE_SIZE = 0.3;
const DEFAULT_SIZE_SCALE = 0.5;
const DEFAULT_DAMPING = 0.05;
const DEFAULT_MAX_AOE_SIZE = 1;

export const useAdaptiveStressSystemWithCurve = (
    pegs: PegData[],
    beads: BeadData[],
    setPegs: (pegs: PegData[]) => void,
    customCurve: THREE.CatmullRomCurve3 | null,
    adaptiveEnabled: boolean,
    {
        xMin,
        xMax,
        influenceRadius = DEFAULT_INFLUENCE_RADIUS,
        stressFactor = DEFAULT_STRESS_FACTOR,
        baseAoeSize = DEFAULT_BASE_AOE_SIZE,
        sizeScale = DEFAULT_SIZE_SCALE,
        damping = DEFAULT_DAMPING,
        maxAoeSize = DEFAULT_MAX_AOE_SIZE,
    }: AdaptiveCurveParams,
) => {
    useFrame(() => {
        if (!adaptiveEnabled || !customCurve) return;

        const newPegs = pegs.map((peg) => {
            const pegPos = new THREE.Vector3(peg.x, peg.y, 0);

            // Identify nearby beads within the influence radius.
            const nearbyBeads = beads.filter((bead) => {
                const beadPos = new THREE.Vector3(
                    (bead as any).position[0],
                    (bead as any).position[1],
                    (bead as any).position[2] ?? 0,
                );
                return pegPos.distanceTo(beadPos) < influenceRadius;
            });

            // Compute the average y of nearby beads; if none, fall back to the peg's y.
            let avgY: number;
            if (nearbyBeads.length > 0) {
                avgY = nearbyBeads.reduce((sum, bead) =>
                    sum + (bead as any).position[1], 0) / nearbyBeads.length;
            } else {
                avgY = peg.y;
            }

            // Normalize peg.x to [0, 1] based on the defined x-range.
            const t = (peg.x - xMin) / (xMax - xMin);
            const clampedT = Math.min(Math.max(t, 0), 1);

            // Get the target point from the custom curve.
            const targetPoint = customCurve.getPoint(clampedT);

            // Compute stress: positive if target is above average, negative if below.
            const stress = targetPoint.y - avgY;

            // Define desired AoE speed and size.
            // For speed: if stress > 0 (target is higher), we want a positive speed (attraction upward).
            // If stress < 0, the desired speed becomes negative.
            const desiredAoeSpeed = stress * stressFactor;
            // For size: start from a baseline and add a term proportional to the stress magnitude.
            const desiredAoeSize = baseAoeSize + Math.abs(stress) * sizeScale;

            // Smoothly update current peg parameters toward the desired values.
            const newAoeSpeed = peg.aoeSpeed +
                (desiredAoeSpeed - peg.aoeSpeed) * damping;
            let newAoeSize = peg.aoeSize +
                (desiredAoeSize - peg.aoeSize) * damping;
            newAoeSize = Math.min(newAoeSize, maxAoeSize); // Prevent unbounded growth.

            return {
                ...peg,
                aoeSpeed: newAoeSpeed,
                aoeSize: newAoeSize,
                // Enable AoE if the absolute speed exceeds a minimal threshold.
                aoe: Math.abs(newAoeSpeed) > 0.001,
            };
        });

        setPegs(newPegs);
    });
};
