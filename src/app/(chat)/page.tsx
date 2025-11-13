import { Chat } from "@/components/chat";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userName = session?.user?.isAnonymous ? undefined : session?.user?.name;
  return (
    <Chat
      userName={userName}
      initialMessages={[]}
      isReadonly={false}
    />
  );
}
