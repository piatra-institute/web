import * as THREE from 'three';



export interface PegData {
    x: number;
    y: number;
    aoe: boolean;
    aoeSize: number;
    aoeSpeed: number;
}

export interface BeadData {
    id: number;
    position: THREE.Vector3;
}


export const wallColor = '#FFD700';
export const beadColor = '#50C878';
export const pegColor = '#FFD700';


export const pegsYStart = 5;

export const width = 10;
export const height = 30;
export const pegSpacing = 0.3;
export const pegRadius = 0.08;

export const opacity = 0.2;
export const thickness = 0.16;

export const BEAD_RADIUS = 0.04;
