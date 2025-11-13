import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { deleteAllChatsByUserId } from "../db/queries";
import * as schema from "../db/schema";
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

  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        await deleteAllChatsByUserId({ userId: user.id });
      },
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
          .update(schema.chat)
          .set({
            userId: newUser.user.id,
          })
          .where(eq(schema.chat.userId, anonymousUser.user.id));
      },
      emailDomainName: "chat-ai.com",
    }),
    nextCookies(),
  ],
});
