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



export async function getAllCompletions(
    concern: Concern,
) {
    const completions = await database.select().from(discussions_completions).where(
        eq(discussions_completions.concernID, concern.id),
    );

    return completions;
}


export async function getRandomCompletion(
    concern: Concern,
) {
    const completions = await getAllCompletions(concern);
    if (completions.length === 0) {
        return;
    }

    // Simulate a random delay.
    await new Promise((resolve) => {
        const randomTimeout = Math.floor(Math.random() * 1_000 * 6);

        setTimeout(() => {
            resolve(true);
        }, randomTimeout);
    });

    const randomIndex = Math.floor(Math.random() * completions.length);
    const randomResult = completions[randomIndex];

    return JSON.stringify({
        ...concern,
        context: randomResult.completion,
    });
}


export async function storeCompletion(
    concern: Concern,
    data: string,
) {
    try {
        const context = JSON.parse(data).context;

        const result = await database.insert(discussions_completions).values({
            id: uuidv4(),
            createdAt: Date.now() + '',
            concernID: concern.id,
            completion: context,
        });

        return result.rowsAffected === 1;
    } catch (error) {
        console.log(error);

        return;
    }
}
