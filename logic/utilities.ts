export const renderDate = (
    date: string | undefined,
) => {
    if (!date) {
        return
    }

    return new Date(date).toLocaleDateString();
}

export const defocus = () => {
    const focusedElement = document.activeElement;
    if (focusedElement && typeof (focusedElement as any).blur === 'function') {
        (focusedElement as any).blur();
    }
}


export const integerBetweenLimits = (
    maximum: number,
    minimum: number = 0,
) => {
    return Math.floor(
        Math.random() * (maximum - minimum + 1)
    ) + minimum;
}
