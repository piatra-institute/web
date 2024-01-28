'use server';

import OpenAI from 'openai';

import { v4 as uuidv4 } from 'uuid';

import {
    eq,
} from 'drizzle-orm';

import {
    Concern,
} from '@/data';

import database from '@/database';
import {
    discussions_completions,
} from '@/database/schema/dicussions_completions';



const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const REGENERATE_REQUEST_RECYCLE = process.env.REGENERATE_REQUEST_LIMIT === 'true';
const REGENERATE_REQUEST_LIMIT = parseInt(process.env.REGENERATE_REQUEST_LIMIT || '') ?? 10;

class RegenerateRequestLimiter {
    requestsLastDay: number = 0;

    constructor() {
        setInterval(() => {
            this.requestsLastDay = 0;
        }, 1_000 * 60 * 60 * 24);
    }

    public increase() {
        if (this.requestsLastDay < REGENERATE_REQUEST_LIMIT) {
            this.requestsLastDay += 1;
            return true;
        }

        return false;
    }
}

const regenerateRequestLimiter = new RegenerateRequestLimiter();


async function getRandomCompletion(
    concern: Concern,
) {
    const result = await database.select().from(discussions_completions).where(
        eq(discussions_completions.concernID, concern.id),
    );
    if (result.length === 0) {
        return;
    }

    // Simulate a random delay.
    await new Promise((resolve) => {
        const randomTimeout = Math.floor(Math.random() * 1_000 * 10);

        setTimeout(() => {
            resolve(true);
        }, randomTimeout);
    });

    const randomIndex = Math.floor(Math.random() * result.length);
    const randomResult = result[randomIndex];

    return JSON.stringify({
        ...concern,
        context: randomResult.completion,
    });
}


async function storeCompletion(
    concern: Concern,
    data: string,
) {
    try {
        const context = JSON.parse(data).context;

        await database.insert(discussions_completions).values({
            id: uuidv4(),
            createdAt: Date.now() + '',
            concernID: concern.id,
            completion: context,
        });
    } catch (error) {
        console.log(error);

        return;
    }
}


async function regenerate(
    concern: Concern,
) {
    try {
        const canRequest = regenerateRequestLimiter.increase();
        if (!canRequest || REGENERATE_REQUEST_RECYCLE) {
            return await getRandomCompletion(concern);
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


export default regenerate;
