export const randomColor = () => (
    `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
)

export const biasedRandomColor = () => (
    `rgb(${10 + Math.random() * 30}, ${10 + Math.random() * 50}, ${80 + Math.random() * 155})`
)

export const biasedBlueRandomColor = (value: number) => {
    const invertedValue = 100 - value + (Math.random() * value * 0.5);
    const baseRed = Math.floor(10 + invertedValue * 0.3);
    const baseGreen = Math.floor(10 + invertedValue * 0.5);
    const baseBlue = Math.floor(80 + invertedValue * 1.55);

    return `rgb(${baseRed}, ${baseGreen}, ${baseBlue})`;
}

export const biasedLimeRandomColor = (value: number) => {
    const invertedValue = 100 - value + (Math.random() * value * 0.5);
    const baseRed = Math.floor(140 + invertedValue * 0.8);
    const baseGreen = Math.floor(170 + invertedValue * 0.4);
    const baseBlue = Math.floor(140 + invertedValue * 0.3);

    return `rgb(${baseRed}, ${baseGreen}, ${baseBlue})`;
}
