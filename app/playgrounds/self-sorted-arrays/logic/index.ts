import {
    Cell,
} from '@/app/playgrounds/self-sorted-arrays/data';



export const bubbleAlgotype = (
    swap: Cell['swap'],
    queryLeft: () => boolean,
    queryRight: () => boolean,
    swapLeft: () => void,
    swapRight: () => void,
) => {
    switch (swap) {
        case 'frozen':
            break;
        case 'passive':
            break;
        case 'proactive':
        default:
            break;
    }
}


export class SortingCell extends EventTarget {
    public value: number;
    public swap: Cell['swap'];
    public color: string;

    constructor(
        value: number,
        swap: Cell['swap'],
        color: string,
    ) {
        super();

        this.value = value;
        this.swap = swap;
        this.color = color;
    }

    private swapLeft() {
        this.dispatchEvent(new Event('swapLeft'));
    }

    private swapRight() {
        this.dispatchEvent(new Event('swapRight'));
    }

    public tick() {

    }
}


export const biasedRandomColor = () => (
    `rgb(${10 + Math.random() * 30}, ${10 + Math.random() * 50}, ${80 + Math.random() * 155})`
);
export const biasedBlueRandomColor = (value: number) => {
    const invertedValue = 100 - value + (Math.random() * value * 0.5);
    const baseRed = Math.floor(10 + invertedValue * 0.3);
    const baseGreen = Math.floor(10 + invertedValue * 0.5);
    const baseBlue = Math.floor(80 + invertedValue * 1.55);

    return `rgb(${baseRed}, ${baseGreen}, ${baseBlue})`;
};
export const biasedLimeRandomColor = (value: number) => {
    const invertedValue = 100 - value + (Math.random() * value * 0.5);
    const baseRed = Math.floor(140 + invertedValue * 0.8);
    const baseGreen = Math.floor(170 + invertedValue * 0.4);
    const baseBlue = Math.floor(140 + invertedValue * 0.3);

    return `rgb(${baseRed}, ${baseGreen}, ${baseBlue})`;
};
