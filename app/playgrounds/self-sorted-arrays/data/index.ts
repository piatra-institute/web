export interface Cell {
    id: string;
    value: number;
    color: string;
    algotype: 'bubble' | 'insertion' | 'selection';

    /**
     * frozen: no swapping whatsoever
     * passive: will swap with other cells at request, but will not initiate swapping
     * proactive: will swap and will initiate swapping
     */
    swap?: 'frozen' | 'passive' | 'proactive';
    /**
     * How many times the cell can be swapped before it becomes passive/frozen
     */
    damageable?: number;
    /**
     * If after X swaps the cell is still surrounded by the same different algotype
     * it will convert to that algotype
     */
    convertible?: number;
    /**
     * After X swaps the cell will split into two cells of the same algotype
     */
    divisible?: number;
    /**
     * After X swaps the cell will die
     */
    apoptosable?: number;
    /**
     * How fast the cell will initiate swapping
     */
    speed?: number;
    /**
     * How fast the cell will respond to swapping
     */
    reponsiveness?: number;

    // render 2D navigate up/down/left/right
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
