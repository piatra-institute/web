import {
    sqliteTable,
    text,
    index,
} from 'drizzle-orm/sqlite-core';



export const discussions_completions = sqliteTable(
    'discussions_completions',
    {
        id: text('id').notNull().primaryKey(),
        createdAt: text('created_at').notNull(),
        concernID: text('concern_id').notNull(),
        completion: text('completion').notNull(),
    },
    (discussions_completions) => ({
        concernIDx: index('concernIDx').on(discussions_completions.concernID),
    }),
);
