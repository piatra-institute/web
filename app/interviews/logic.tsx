import data from './data';



export const getInterviewIDs = () => {
    return data.interviews.map(interview => ({
        params: {
            id: interview.id,
        },
    }));
}


export const getInterviews = () => {
    return data.interviews;
}


export const findInterview = (
    id: string,
) => {
    return data.interviews.find(interview => interview.id === id);
}


export const renderDate = (
    date: string | undefined,
) => {
    if (!date) {
        return
    }

    return new Date(date).toLocaleDateString();
}
