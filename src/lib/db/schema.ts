import type { InferSelectModel } from "drizzle-orm";
import { user } from "./auth-schema";
import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
export * from "./auth-schema";

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  title: text("title").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["private", "public"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message", {
  id: uuid("id").primaryKey(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const document = pgTable("Document", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  title: text("title").notNull(),
  content: text("content"),
  kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
    .notNull()
    .default("text"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export type Document = InferSelectModel<typeof document>;
