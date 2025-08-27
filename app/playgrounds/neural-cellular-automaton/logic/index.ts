export interface NeuralCell {
    state: number;
    activation: number[];
    weights: number[][];
    bias: number[];
    history: number[];
}

export interface GridState {
    cells: NeuralCell[][];
    generation: number;
    fitness: number;
}

export class NeuralCellularAutomaton {
    private grid: NeuralCell[][];
    private nextGrid: NeuralCell[][];
    private gridSize: number;
    private layers: number;
    private neuronsPerCell: number;
    private generation: number = 0;
    private activationFunction: string;
    private learningRate: number;
    
    constructor(
        gridSize: number,
        layers: number,
        neuronsPerCell: number,
        activationFunction: string = 'sigmoid',
        learningRate: number = 0.01
    ) {
        this.gridSize = gridSize;
        this.layers = layers;
        this.neuronsPerCell = neuronsPerCell;
        this.activationFunction = activationFunction;
        this.learningRate = learningRate;
        
        this.grid = this.initializeGrid();
        this.nextGrid = this.initializeGrid();
    }
    
    private initializeGrid(): NeuralCell[][] {
        const grid: NeuralCell[][] = [];
        for (let i = 0; i < this.gridSize; i++) {
            grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                grid[i][j] = this.createNeuralCell();
            }
        }
        return grid;
    }
    
    private createNeuralCell(): NeuralCell {
        const cell: NeuralCell = {
            state: Math.random() > 0.5 ? 1 : 0,
            activation: new Array(this.neuronsPerCell).fill(0).map(() => Math.random()),
            weights: [],
            bias: new Array(this.neuronsPerCell).fill(0).map(() => (Math.random() - 0.5) * 0.1),
            history: []
        };
        
        for (let l = 0; l < this.layers; l++) {
            const layerWeights = [];
            const inputSize = l === 0 ? 9 : this.neuronsPerCell;
            for (let n = 0; n < this.neuronsPerCell; n++) {
                const neuronWeights = new Array(inputSize).fill(0).map(() => (Math.random() - 0.5) * 2);
                layerWeights.push(neuronWeights);
            }
            cell.weights.push(layerWeights);
        }
        
        return cell;
    }
    
    private getNeighbors(x: number, y: number): NeuralCell[] {
        const neighbors: NeuralCell[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const nx = (x + dx + this.gridSize) % this.gridSize;
                const ny = (y + dy + this.gridSize) % this.gridSize;
                neighbors.push(this.grid[nx][ny]);
            }
        }
        return neighbors;
    }
    
    private activate(x: number): number {
        switch (this.activationFunction) {
            case 'sigmoid':
                return 1 / (1 + Math.exp(-x));
            case 'tanh':
                return Math.tanh(x);
            case 'relu':
                return Math.max(0, x);
            case 'leaky_relu':
                return x > 0 ? x : 0.01 * x;
            default:
                return 1 / (1 + Math.exp(-x));
        }
    }
    
    private processNeuralNetwork(cell: NeuralCell, neighbors: NeuralCell[]): number[] {
        const input = neighbors.map(n => n.state);
        let currentActivation = input.map(i => Number(i));
        
        for (let layer = 0; layer < this.layers; layer++) {
            const newActivation = [];
            for (let n = 0; n < this.neuronsPerCell; n++) {
                let sum = cell.bias[n];
                for (let i = 0; i < currentActivation.length; i++) {
                    sum += currentActivation[i] * cell.weights[layer][n][i];
                }
                newActivation.push(this.activate(sum));
            }
            currentActivation = newActivation;
        }
        
        return currentActivation;
    }
    
    private applyHebbianLearning(cell: NeuralCell, input: number[], output: number[]): void {
        for (let layer = 0; layer < this.layers; layer++) {
            for (let n = 0; n < this.neuronsPerCell; n++) {
                for (let i = 0; i < cell.weights[layer][n].length; i++) {
                    const delta = this.learningRate * output[n] * (layer === 0 ? input[i] : output[i]);
                    cell.weights[layer][n][i] += delta;
                    cell.weights[layer][n][i] = Math.max(-5, Math.min(5, cell.weights[layer][n][i]));
                }
            }
        }
    }
    
    public step(evolutionMode: string = 'hebbian', rule: number = 30): void {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const cell = this.grid[x][y];
                const neighbors = this.getNeighbors(x, y);
                
                const neuralOutput = this.processNeuralNetwork(cell, neighbors);
                
                const newCell = {
                    ...cell,
                    activation: neuralOutput,
                    state: neuralOutput[0] > 0.5 ? 1 : 0,
                    history: [...cell.history.slice(-9), cell.state]
                };
                
                if (evolutionMode === 'hebbian') {
                    const input = neighbors.map(n => n.state);
                    this.applyHebbianLearning(newCell, input, neuralOutput);
                }
                
                if (evolutionMode === 'ca_rule' && this.gridSize === 1) {
                    const pattern = neighbors.slice(0, 3).map(n => n.state).reduce((acc, val, idx) => acc + val * Math.pow(2, 2 - idx), 0);
                    newCell.state = (rule >> pattern) & 1;
                }
                
                this.nextGrid[x][y] = newCell;
            }
        }
        
        const temp = this.grid;
        this.grid = this.nextGrid;
        this.nextGrid = temp;
        this.generation++;
    }
    
    public mutate(mutationRate: number): void {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const cell = this.grid[x][y];
                for (let layer = 0; layer < this.layers; layer++) {
                    for (let n = 0; n < this.neuronsPerCell; n++) {
                        for (let i = 0; i < cell.weights[layer][n].length; i++) {
                            if (Math.random() < mutationRate) {
                                cell.weights[layer][n][i] += (Math.random() - 0.5) * 0.2;
                                cell.weights[layer][n][i] = Math.max(-5, Math.min(5, cell.weights[layer][n][i]));
                            }
                        }
                        if (Math.random() < mutationRate) {
                            cell.bias[n] += (Math.random() - 0.5) * 0.1;
                        }
                    }
                }
            }
        }
    }
    
    public calculateFitness(fitnessFunction: string): number {
        let fitness = 0;
        
        switch (fitnessFunction) {
            case 'complexity':
                for (let x = 0; x < this.gridSize; x++) {
                    for (let y = 0; y < this.gridSize; y++) {
                        const cell = this.grid[x][y];
                        const neighbors = this.getNeighbors(x, y);
                        const differentNeighbors = neighbors.filter(n => n.state !== cell.state).length;
                        fitness += differentNeighbors / 8;
                    }
                }
                break;
                
            case 'stability':
                for (let x = 0; x < this.gridSize; x++) {
                    for (let y = 0; y < this.gridSize; y++) {
                        const cell = this.grid[x][y];
                        if (cell.history.length > 1) {
                            const stable = cell.history[cell.history.length - 1] === cell.state;
                            fitness += stable ? 1 : 0;
                        }
                    }
                }
                break;
                
            case 'oscillation':
                for (let x = 0; x < this.gridSize; x++) {
                    for (let y = 0; y < this.gridSize; y++) {
                        const cell = this.grid[x][y];
                        if (cell.history.length > 2) {
                            const oscillates = cell.history[cell.history.length - 2] === cell.state &&
                                              cell.history[cell.history.length - 1] !== cell.state;
                            fitness += oscillates ? 1 : 0;
                        }
                    }
                }
                break;
                
            case 'diversity':
                const activationSet = new Set<string>();
                for (let x = 0; x < this.gridSize; x++) {
                    for (let y = 0; y < this.gridSize; y++) {
                        const cell = this.grid[x][y];
                        activationSet.add(cell.activation.map(a => Math.round(a * 100) / 100).join(','));
                    }
                }
                fitness = activationSet.size;
                break;
        }
        
        return fitness / (this.gridSize * this.gridSize);
    }
    
    public getGridState(): GridState {
        return {
            cells: this.grid.map(row => [...row]),
            generation: this.generation,
            fitness: this.calculateFitness('complexity')
        };
    }
    
    public reset(): void {
        this.grid = this.initializeGrid();
        this.nextGrid = this.initializeGrid();
        this.generation = 0;
    }
}