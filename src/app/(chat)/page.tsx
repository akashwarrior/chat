import { Chat } from "@/components/chat";
import { cookies } from "next/headers";

export default async function Home() {
  const id = ''

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const model = modelIdFromCookie?.value || 'DEFAULT_CHAT_MODEL';


  return (
    <Chat
      autoResume={false}
      id={id}
      initialChatModel={model}
      initialMessages={[]}
      isReadonly={false}
    />
  );
}
