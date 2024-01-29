import {
    Concern,
} from '@/data';

import {
    getAllCompletions,
} from './completions';



async function getRegeneratedProvocationContext(
    concern: Concern,
) {
    try {
        const completions = await getAllCompletions(concern);

        return completions;
    } catch (error) {
        console.log(error);

        return;
    }
}


export default getRegeneratedProvocationContext;
