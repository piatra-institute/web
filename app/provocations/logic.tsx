import data from './data';



export const getProvocationIDs = () => {
    return data.provocations.map(provocation => ({
        params: {
            id: provocation.id,
        },
    }));
}


export const getProvocations = () => {
    return data.provocations;
}


export const findProvocationByPath = (
    path: string,
) => {
    return data.provocations.find(provocation => provocation.path === path);
}


export const renderDate = (
    date: string | undefined,
) => {
    if (!date) {
        return
    }

    return new Date(date).toLocaleDateString();
}
