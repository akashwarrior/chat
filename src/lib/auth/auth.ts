import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "../db/auth-schema";
import { db } from "@/lib/db";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },

    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60,
        },
    },

    plugins: [nextCookies()],
});