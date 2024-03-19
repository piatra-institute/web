import data from './data';



export const getPathFromParams = (
    path: string,
) => {
    if (!Array.isArray(path)) {
        return '';
    }

    return path.join('/');
}


export const getPressItemsIDs = () => {
    return data.press.map(pressItem => ({
        params: {
            id: pressItem.id,
        },
    }));
}


export const getPressItems = () => {
    return data.press;
}


export const findPressItemByPath = (
    path: string,
) => {
    return data.press.find(pressItem => pressItem.path === path);
}
