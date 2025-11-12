ALTER TABLE "Document" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Document" CASCADE;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "user_id_index" ON "Chat" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "chat_id_index" ON "Message" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "account_user_id_index" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_index" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_index" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_index" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "identifier_index" ON "verification" USING btree ("identifier");