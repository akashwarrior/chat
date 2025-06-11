import type { Message } from 'ai';
import { useState, useEffect } from 'react';
import { appendMessage, getMessagesById, setMessagesById } from '@/lib/persistence/db';

export function useChatHistory({ db, chatId }: { db?: IDBDatabase, chatId: string }) {
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (!db) return;

    getMessagesById(db, chatId)
      .then((storedMessages) => setInitialMessages(storedMessages?.messages ?? []))
      .finally(() => setReady(true));

    return () => {
      setInitialMessages([]);
    }
  }, [db, chatId]);

  return {
    ready,
    initialMessages,
    storeMessageHistory: async (msg: Message) => {
      if (!db) return;
      await appendMessage(db, chatId, msg);
    },
    setInitialMessages: async (messages: Message[]) => {
      if (!db) return;
      await setMessagesById(db, chatId, messages);
      setInitialMessages(messages);
    },
  };
}