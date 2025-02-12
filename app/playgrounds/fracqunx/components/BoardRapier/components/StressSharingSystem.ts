import { PegData, BeadData } from '../data';
import * as THREE from 'three';



interface GridCell {
    beadCount: number;
    targetFill: boolean;
    desiredCount: number;
    position: THREE.Vector2;
}

export class AdaptiveStressSystem {
    private pegs: PegData[];
    private gridCells: GridCell[][] = [];
    private targetCurve: THREE.CatmullRomCurve3 | null;
    private readonly gridSize = 30; // Increased grid resolution
    private readonly cellSize = 0.15; // Smaller cells for better precision
    private readonly maxStress = 2.0; // Increased maximum stress
    private readonly minAoeSize = 0.2; // Minimum AOE size
    private readonly maxAoeSize = 0.6; // Maximum AOE size
    private readonly baseDeflectionStrength = 1.5; // Increased base deflection strength

    constructor(pegs: PegData[], targetCurve: THREE.CatmullRomCurve3 | null) {
        this.pegs = pegs;
        this.targetCurve = targetCurve;
        this.initializeGrid();
    }

    private initializeGrid() {
        this.gridCells = [];
        const gridOffset = (this.gridSize * this.cellSize) / 2;

        // Create grid
        for (let i = 0; i < this.gridSize; i++) {
            this.gridCells[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                const x = (i * this.cellSize) - gridOffset;
                const y = (j * this.cellSize) - gridOffset;
                this.gridCells[i][j] = {
                    beadCount: 0,
                    targetFill: false,
                    desiredCount: 0,
                    position: new THREE.Vector2(x, y)
                };
            }
        }

        // Calculate target distribution
        if (this.targetCurve) {
            const samples = 500; // Increased sampling
            const points: THREE.Vector3[] = [];
            for (let i = 0; i < samples; i++) {
                const t = i / (samples - 1);
                points.push(this.targetCurve.getPoint(t));
            }

            // Mark target cells and set desired bead counts
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    const cellPos = this.gridCells[i][j].position;
                    const closestPoint = points.reduce((closest, point) => {
                        const dist = new THREE.Vector2(point.x, point.y).distanceTo(cellPos);
                        return dist < closest.dist ? { point, dist } : closest;
                    }, { point: points[0], dist: Infinity });

                    if (closestPoint.dist < this.cellSize * 1.5) {
                        this.gridCells[i][j].targetFill = true;
                        // Higher desired counts for cells further from center
                        const distFromCenter = Math.abs(cellPos.x);
                        this.gridCells[i][j].desiredCount = Math.ceil(5 + distFromCenter * 10);
                    }
                }
            }
        }
    }

    private updateBeadDistribution(beads: BeadData[]) {
        // Reset bead counts
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.gridCells[i][j].beadCount = 0;
            }
        }

        // Count beads in each cell
        const gridOffset = (this.gridSize * this.cellSize) / 2;
        beads.forEach(bead => {
            const [x, y] = bead.position;
            const gridX = Math.floor((x + gridOffset) / this.cellSize);
            const gridY = Math.floor((y + gridOffset) / this.cellSize);

            if (gridX >= 0 && gridX < this.gridSize &&
                gridY >= 0 && gridY < this.gridSize) {
                this.gridCells[gridX][gridY].beadCount++;
            }
        });
    }

    private calculatePegInfluence(pegPosition: THREE.Vector2): {stress: number, direction: number} {
        const gridOffset = (this.gridSize * this.cellSize) / 2;
        const pegGridX = Math.floor((pegPosition.x + gridOffset) / this.cellSize);
        const pegGridY = Math.floor((pegPosition.y + gridOffset) / this.cellSize);

        let totalError = 0;
        let weightedDirection = 0;
        let totalWeight = 0;

        // Analyze a larger area around the peg
        const searchRadius = 4;
        for (let i = -searchRadius; i <= searchRadius; i++) {
            for (let j = -searchRadius; j <= searchRadius; j++) {
                const checkX = pegGridX + i;
                const checkY = pegGridY + j;

                if (checkX >= 0 && checkX < this.gridSize &&
                    checkY >= 0 && checkY < this.gridSize) {
                    const cell = this.gridCells[checkX][checkY];
                    if (cell.targetFill) {
                        const weight = 1 / (Math.abs(i) + 1); // Weight closer cells more
                        const error = cell.desiredCount - cell.beadCount;
                        totalError += Math.abs(error) * weight;

                        // Direction is based on where we need more beads
                        if (error > 0) {
                            const directionInfluence = Math.sign(i) * weight * error;
                            weightedDirection += directionInfluence;
                            totalWeight += weight;
                        }
                    }
                }
            }
        }

        const normalizedError = Math.min(totalError / (searchRadius * 2), this.maxStress);
        const direction = totalWeight > 0 ? weightedDirection / totalWeight : 0;

        return {
            stress: normalizedError,
            direction: Math.sign(direction)
        };
    }

    public updatePegProperties(beads: BeadData[]): PegData[] {
        this.updateBeadDistribution(beads);

        return this.pegs.map((peg) => {
            const pegPosition = new THREE.Vector2(peg.x, peg.y);
            const { stress, direction } = this.calculatePegInfluence(pegPosition);

            // Enhanced AOE properties
            const aoeSize = this.minAoeSize +
                (this.maxAoeSize - this.minAoeSize) * (stress / this.maxStress);
            const aoeSpeed = direction * this.baseDeflectionStrength * stress;

            return {
                ...peg,
                aoe: true, // Always active for stronger influence
                aoeSize,
                aoeSpeed,
            };
        });
    }

    public setTargetCurve(curve: THREE.CatmullRomCurve3 | null) {
        this.targetCurve = curve;
        this.initializeGrid();
    }
}
