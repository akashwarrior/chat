import { AVAILABLE_MODEL_IDS, DEFAULT_MODEL } from "@/ai/config";
import { z } from "zod";

const messagePartSchema = z.object({ type: z.string().min(1) }).loose();

const uiMessageSchema = z
  .object({
    id: z.string().min(1),
    role: z.enum(["system", "user", "assistant"]),
    parts: z.array(messagePartSchema).min(1),
  })
  .loose();

export const postChatRequestSchema = z.object({
  id: z.uuid(),
  messages: z.array(uiMessageSchema).min(1),
  modelId: z.enum(AVAILABLE_MODEL_IDS).optional().default(DEFAULT_MODEL),
  trigger: z.enum(["submit-message", "regenerate-message"]).optional(),
});

export const chatIdSchema = z.object({
  id: z.uuid(),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).max(10_000).default(0),
  searchQuery: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value || null),
});
