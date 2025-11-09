import type { InferSelectModel } from "drizzle-orm";
import { user } from "./auth-schema";
import {
  boolean,
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
  userId: text("userId").notNull().references(() => user.id),
  visibility: varchar("visibility", { enum: ["private", "public"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("Message", {
  id: text("id").primaryKey(),
  chatId: uuid("chatId").notNull().references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").primaryKey(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: text("userId").notNull().references(() => user.id),
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").primaryKey(),
    documentId: uuid("documentId").notNull().references(() => document.id),
    documentCreatedAt: timestamp("documentCreatedAt").defaultNow().notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: text("userId").notNull().references(() => user.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").primaryKey(),
    chatId: uuid("chatId").notNull().references(() => chat.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type Stream = InferSelectModel<typeof stream>;
