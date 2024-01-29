'use server';

import {
    Concern,

    REGENERATE_REQUEST_RECYCLE,
    REGENERATE_REQUEST_PER_CONCERN_LIMIT,
} from '@/data';

import openai from '@/services/openai';

import regenerateRequestLimiter from '@/services/regenerateRequestLimiter';

import {
    getAllCompletions,
    getRandomCompletion,
    storeCompletion,
} from './completions';



async function regenerateProvocationContext(
    concern: Concern,
) {
    try {
        const completions = await getAllCompletions(concern);

        const canRequest = regenerateRequestLimiter.increase();
        if (
            !canRequest
            || REGENERATE_REQUEST_RECYCLE
            || completions.length >= REGENERATE_REQUEST_PER_CONCERN_LIMIT
        ) {
            return await getRandomCompletion(concern, completions);
        }

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `
                        You will receive a structure for a conversation, a concern given a particular "text" question within a certain "context" based on various "references".
                        Generate only a new version of the "context" keeping more or less the initial line of thought,
                            don't be afraid to deviate from the original text, but keep the same "spirit",
                            try to look for new examples,
                            try to look for new questions,
                            maybe even look for references connected with those given,
                            try not to be overly verbose, yet use words and concepts that are in the scientific, academic area
                    `,
                },
                {
                    role: 'user',
                    content: `
                        \`\`\` json
                        ${JSON.stringify(concern)}
                        \`\`\`
                    `,
                },
            ],
            model: 'gpt-4-turbo-preview',
            response_format: { type: 'json_object' },
        });

        const data = completion.choices[0].message.content;
        if (!data) {
            return;
        }

        await storeCompletion(
            concern,
            data,
        );

        return data;
    } catch (error) {
        console.log(error);

        return;
    }
}


export default regenerateProvocationContext;
