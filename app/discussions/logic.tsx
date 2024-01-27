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


export const findDiscussion = (
    id: string,
) => {
    return data.discussions.find(discussion => discussion.id === id);
}


export const renderDate = (
    date: string | undefined,
) => {
    if (!date) {
        return
    }

    return new Date(date).toLocaleDateString();
}
