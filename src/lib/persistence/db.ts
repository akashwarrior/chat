import type { Message } from 'ai';

interface ChatHistoryItem {
  id: string;
  messages: Message[];
}

export async function openDatabase(): Promise<IDBDatabase | undefined> {
  if (typeof window === 'undefined') {
    return;
  }
  return new Promise((resolve) => {
    const request = indexedDB.open('chatHistory', 1);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('chats')) {
        const store = db.createObjectStore('chats', { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = () => {
      resolve(undefined);
    };
  });
}

export async function setMessagesById(db: IDBDatabase, id: string, messages: Message[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');

    const request = store.put({
      id,
      messages,
    })

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getMessagesById(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteById(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');
    const request = store.delete(id);

    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function appendMessage(db: IDBDatabase, id: string, message: Message): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const chatHistory = await getMessagesById(db, id);

      if (chatHistory) {
        const updatedMessages = [...chatHistory.messages, message];
        await setMessagesById(db, id, updatedMessages);
        resolve();
      } else {
        await setMessagesById(db, id, [message]);
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}