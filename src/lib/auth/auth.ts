import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "../db/auth-schema";
import { getRedisClient } from "../redis";
import { anonymous } from "better-auth/plugins";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

const redis = getRedisClient();
await redis.connect();

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

  secondaryStorage: {
    get: async (key) => {
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      if (ttl)
        await redis.set(key, value, { expiration: { type: "EX", value: ttl } });
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },

  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await db
          .update(schema.user)
          .set({
            email: newUser.user.email,
            name: newUser.user.name,
            image: newUser.user.image,
            isAnonymous: false,
          })
          .where(eq(schema.user.id, anonymousUser.user.id));
      },
      disableDeleteAnonymousUser: true,
      emailDomainName: "chat-ai.com",
    }),
    nextCookies(),
  ],
});
