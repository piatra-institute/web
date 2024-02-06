import data from './data';



export const getPaperIDs = () => {
    return data.papers.map(paper => ({
        params: {
            id: paper.id,
        },
    }));
}


export const getPapers = () => {
    return data.papers;
}


export const findPaperByPath = (
    path: string,
) => {
    return data.papers.find(paper => paper.path === path);
}
