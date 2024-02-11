/**
 * Fisher-Yates (aka Knuth) Shuffle.
 *
 * https://stackoverflow.com/a/2450976
 */
const shuffle = <T>(array: T[]) => {
    const shuffled = [...array];

    let currentIndex = shuffled.length;
    let randomIndex;

    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [shuffled[currentIndex], shuffled[randomIndex]] = [
            shuffled[randomIndex], shuffled[currentIndex]
        ];
    }

    return shuffled;
}


const splitNeighbors = (neighbors: (Cell | undefined)[]): [ (Cell | undefined)[], (Cell | undefined)[] ] => {
    if (neighbors.length === 0) {
        return [[], []];
    }
    if (neighbors.length === 1) {
        return [[neighbors[0]], []];
    }
    if (neighbors.length === 2) {
        return [[neighbors[0]], [neighbors[1]]];
    }

    const midIndex = Math.floor(neighbors.length / 2);
    const left = neighbors.slice(0, midIndex);
    const right = neighbors.slice(midIndex);

    return [left, right];
}

const getNeighbor = (neighbors: (Cell | undefined)[]): Cell | undefined => {
    const randomIndex = Math.floor(Math.random() * neighbors.length);
    return neighbors[randomIndex];
}

const algotypes = {
    'bubble': (neighbors: (Cell | undefined)[], cell: Cell) => {
        const [left, right] = splitNeighbors(neighbors);
        const randomLeft = getNeighbor(left);
        const randomRight = getNeighbor(right);

        if (randomLeft && randomLeft.value > cell.value) {
            return randomLeft.id;
        }
        if (randomRight && randomRight.value < cell.value) {
            return randomRight.id;
        }
    },
    'insertion': (neighbors: (Cell | undefined)[], cell: Cell) => {
        const [left] = splitNeighbors(neighbors);
        const randomLeft = getNeighbor(left);

        if (randomLeft && randomLeft.value > cell.value) {
            return randomLeft.id;
        }
    },
    'selection': (neighbors: (Cell | undefined)[], cell: Cell) => {
        const [left] = splitNeighbors(neighbors);
        const randomLeft = getNeighbor(left);

        if (randomLeft && randomLeft.value > cell.value) {
            return randomLeft.id;
        }
    },
};

type Algotype = 'bubble' | 'insertion' | 'selection';


export class Cell extends EventTarget {
    public id: string;
    public value: number;
    public color: string;
    public algotype: Algotype;

    private neighbors: (Cell | undefined)[];


    constructor(
        id: string,
        value: number,
        color: string,
        algotype: Algotype,
    ) {
        super();

        this.id = id;
        this.value = value;
        this.color = color;
        this.algotype = algotype;
        this.neighbors = [];
    }


    public addNeighbor(neighbor: Cell | undefined) {
        this.neighbors.push(neighbor);
    }
    public removeNeighbor(neighbor: Cell) {
        this.neighbors = this.neighbors.filter((n) => n?.id !== neighbor.id);
    }
    public cleanNeighbors() {
        this.neighbors = [];
    }

    public sort() {
        const swapID = algotypes[this.algotype](this.neighbors, this);
        if (swapID) {
            this.dispatchEvent(
                new CustomEvent('swap', {'detail': {
                    'cellID': this.id,
                    'swapID': swapID,
                }}),
            );
        }
    }
}


export class Tissue {
    public cells: Cell[];
    private swapNotify?: (cellID: string, swapID: string) => void;

    constructor(
        swapNotify?: (cellID: string, swapID: string) => void,
    ) {
        this.cells = [];
        this.swapNotify = swapNotify;
    }

    public addCell(cell: Cell) {
        cell.addEventListener('swap', this.swap.bind(this));
        this.cells.push(cell);
    }
    public removeCell(cell: Cell) {
        cell.removeEventListener('swap', this.swap.bind(this));
        this.cells = this.cells.filter((c) => c.id !== cell.id);
    }

    public step() {
        shuffle(this.cells).forEach((cell) => {
        // this.cells.forEach((cell) => {
            this.distributeNeighbors();

            cell.sort();
        });
    }


    private distributeNeighbors() {
        this.cells.forEach((cell, index) => {
            cell.cleanNeighbors();

            if (cell.algotype === 'bubble') {
                if (index === 0) {
                    cell.addNeighbor(undefined); // LEFT
                    cell.addNeighbor(this.cells[index + 1]); // RIGHT
                }

                if (index > 0) {
                    cell.addNeighbor(this.cells[index - 1]); // LEFT
                    cell.addNeighbor(this.cells[index + 1]); // RIGHT
                }
            }

            if (cell.algotype === 'insertion') {
                if (index > 0) {
                    cell.addNeighbor(this.cells[index - 1]);
                }
            }

            if (cell.algotype === 'selection') {
                if (index < this.cells.length - 1) {
                    cell.addNeighbor(this.cells[index + 1]);
                }
            }
        });
    }

    private swap(event: Event) {
        const {
            cellID,
            swapID,
        } = (event as CustomEvent).detail;

        if (this.swapNotify) {
            this.swapNotify(cellID, swapID);
        }

        const cellIndex = this.cells.findIndex((c) => c.id === cellID);
        const swapIndex = this.cells.findIndex((c) => c.id === swapID);

        if (cellIndex === -1 || swapIndex === -1) {
            return;
        }

        [this.cells[cellIndex], this.cells[swapIndex]] = [
            this.cells[swapIndex], this.cells[cellIndex]
        ];
    }
}


export class Organ {
    public tissues: Tissue[] = [];

    constructor() {
    }


    public addTissue(tissue: Tissue) {
        this.tissues.push(tissue);
    }
    public removeTissue(tissue: Tissue) {
        this.tissues = this.tissues.filter((t) => t !== tissue);
    }

    public step() {
        shuffle(this.tissues).forEach((tissue) => {
            this.reconfigureTissues();
            tissue.step();
        });
    }

    private reconfigureTissues() {

    }
}
