import type { InferSelectModel } from "drizzle-orm";
import { user } from "./auth-schema";
import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
export * from "./auth-schema";

export type User = InferSelectModel<typeof user>;

export const chat = pgTable(
  "Chat",
  {
    id: uuid("id").primaryKey(),
    title: text("title").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    visibility: varchar("visibility", { enum: ["private", "public"] })
      .notNull()
      .default("private"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_id_index").on(table.userId),
    index("user_id_updated_at_index").on(table.userId, table.updatedAt),
  ],
);

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable(
  "Message",
  {
    id: uuid("id").primaryKey(),
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id, { onDelete: "cascade" }),
    role: varchar("role").notNull(),
    parts: json("parts").notNull(),
    attachments: json("attachments").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("chat_id_index").on(table.chatId),
    index("chat_id_created_at_index").on(table.chatId, table.createdAt),
  ],
);

export type DBMessage = InferSelectModel<typeof message>;
