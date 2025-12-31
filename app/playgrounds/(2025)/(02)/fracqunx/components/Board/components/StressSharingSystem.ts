import { useEffect } from "react";
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

// Default parameter values
const DEFAULT_INFLUENCE_RADIUS = 1;
const DEFAULT_STRESS_FACTOR = 0.1;
const DEFAULT_BASE_AOE_SIZE = 0.3;
const DEFAULT_SIZE_SCALE = 0.5;
const DEFAULT_DAMPING = 0.05;
const DEFAULT_MAX_AOE_SIZE = 1;

export const useAdaptiveStressUpdateLoop = (
    pegs: PegData[],
    beads: BeadData[],
    setPegs: any,
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
    useEffect(() => {
        if (!adaptiveEnabled || !customCurve) return;

        const intervalId = setInterval(() => {
            setPegs((oldPegs: any) => {
                return oldPegs.map((peg: any) => {
                    // Peg position
                    const pegPos = new THREE.Vector3(peg.x, peg.y, 0);

                    // Nearby beads
                    const nearbyBeads = beads.filter((bead) => {
                        const beadPos = new THREE.Vector3(
                            (bead as any).position[0],
                            (bead as any).position[1],
                            (bead as any).position[2] ?? 0,
                        );
                        return pegPos.distanceTo(beadPos) < influenceRadius;
                    });

                    // Average Y of those beads
                    const avgY = nearbyBeads.length > 0
                        ? nearbyBeads.reduce(
                            (sum, b) => sum + (b as any).position[1],
                            0,
                        ) / nearbyBeads.length
                        : peg.y;

                    // Sample the curve at normalized x
                    const t = (peg.x - xMin) / (xMax - xMin);
                    const clampedT = Math.min(Math.max(t, 0), 1);
                    const targetPoint = customCurve.getPoint(clampedT);

                    // Inverted stress: if beads are above target, stress is positive
                    const stress = avgY - targetPoint.y;

                    // Check if we exceed an activation threshold
                    const stressMag = Math.abs(stress);
                    let newAoe = stressMag > 0.2; // or whatever threshold you prefer

                    // If active, compute desired speed & size
                    const desiredAoeSpeed = newAoe ? stress * stressFactor : 0;
                    const desiredAoeSize = newAoe
                        ? baseAoeSize + stressMag * sizeScale
                        : 0;

                    // Damping
                    const damp = (from: number, to: number) =>
                        from + (to - from) * damping;

                    // Update with damping & clamp
                    const updatedSpeed = damp(peg.aoeSpeed, desiredAoeSpeed);
                    let updatedSize = damp(peg.aoeSize, desiredAoeSize);
                    updatedSize = Math.min(updatedSize, maxAoeSize);

                    return {
                        ...peg,
                        aoeSpeed: updatedSpeed,
                        aoeSize: updatedSize,
                        aoe: newAoe,
                    };
                });
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, [
        adaptiveEnabled,
        customCurve,
        beads,
        setPegs,
        xMin,
        xMax,
        influenceRadius,
        stressFactor,
        baseAoeSize,
        sizeScale,
        damping,
        maxAoeSize,
    ]);
};
