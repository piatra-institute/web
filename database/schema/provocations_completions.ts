import {
    sqliteTable,
    text,
    index,
} from 'drizzle-orm/sqlite-core';



export const provocations_completions = sqliteTable(
    'provocations_completions',
    {
        id: text('id').notNull().primaryKey(),
        createdAt: text('created_at').notNull(),
        concernID: text('concern_id').notNull(),
        completion: text('completion').notNull(),
    },
    (provocations_completions) => ({
        concernIDx: index('concernIDx').on(provocations_completions.concernID),
    }),
);
