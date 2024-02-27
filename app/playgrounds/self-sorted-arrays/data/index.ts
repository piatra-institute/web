export type CellAlgotype = 'bubble' | 'insertion' | 'selection';
export type CellSwap = 'frozen' | 'passive' | 'proactive';
export type CellMutationStrategy = 'random' | 'increment' | 'decrement' | 'environmental';


export interface CellData {
    id: string;
    value: number;
    color: string;
    algotype: CellAlgotype;

    /**
     * frozen: no swapping whatsoever
     * passive: will swap with other cells at request, but will not initiate swapping
     * proactive: will swap and will initiate swapping
     */
    swap?: CellSwap;
    /**
     * After X swaps the cell will mutate into a different value.
     */
    mutationable?: number;
    /**
     * How the cell will mutate:
     * - random: will mutate to a random value
     * - increment: will mutate to an increased value
     * - decrement: will mutate to a decreased value
     * - environmental: will mutate to the value of the surrounding cells
     */
    mutationStrategy?: CellMutationStrategy;
    /**
     * How many times the cell can swap before it becomes passive/frozen.
     */
    damageable?: number;
    /**
     * If after X swaps the cell is still surrounded by the same different algotype
     * it will convert to that algotype.
     */
    convertible?: number;
    /**
     * After X swaps the cell will split into two cells of the same algotype.
     */
    divisible?: number;
    /**
     * After X swaps the cell will die.
     */
    apoptosable?: number;
    /**
     * How fast the cell will initiate swapping (in milliseconds).
     */
    speed?: number;
    /**
     * How fast the cell will respond to swapping (in milliseconds).
     */
    responsiveness?: number;
}


export const algotypes = [
    'bubble',
    'insertion',
    'selection',
    // 'quick',
    // 'merge',
    // 'heap',
] as const;


export const swap = [
    'frozen',
    'passive',
    'proactive',
] as const;



export interface CellOptions {
    minimumValue: number;
    maximumValue: number;

    mutationableMinimum: number;
    mutationableMaximum: number;
    mutationableStrategy: CellMutationStrategy;

    damageableMinimum: number;
    damageableMaximum: number;
    damageablePassiveThreshold: number;
    damageableFrozenThreshold: number;

    convertibleMinimum: number;
    convertibleMaximum: number;

    divisibleMinimum: number;
    divisibleMaximum: number;

    apoptosableMinimum: number;
    apoptosableMaximum: number;

    speedMinimum: number;
    speedMaximum: number;

    responsivenessMinimum: number;
    responsivenessMaximum: number;
}
