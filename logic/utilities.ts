export const renderDate = (
    date: string | undefined,
) => {
    if (!date) {
        return
    }

    return new Date(date).toLocaleDateString();
}
