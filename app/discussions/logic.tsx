import data from './data';



export const getDiscussionIDs = () => {
    return data.discussions.map(discussion => ({
        params: {
            id: discussion.id,
        },
    }));
}


export const getDiscussions = () => {
    return data.discussions;
}


export const findDiscussionByPath = (
    path: string,
) => {
    return data.discussions.find(discussion => discussion.path === path);
}


export const renderDate = (
    date: string | undefined,
) => {
    if (!date) {
        return
    }

    return new Date(date).toLocaleDateString();
}
