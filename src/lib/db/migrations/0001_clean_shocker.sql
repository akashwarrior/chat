ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_Chat_id_fk";
--> statement-breakpoint
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_id_updated_at_index" ON "Chat" USING btree ("userId","updatedAt");--> statement-breakpoint
CREATE INDEX "chat_id_created_at_index" ON "Message" USING btree ("chatId","createdAt");