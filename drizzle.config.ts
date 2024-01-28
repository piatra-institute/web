import { Config } from 'drizzle-kit';

import dotenv from 'dotenv';



dotenv.config({
    path: ".env.local",
});


export default {
    schema: './database/schema',
    driver: 'turso',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN!,
    },
    out: './drizzle',
} satisfies Config;
