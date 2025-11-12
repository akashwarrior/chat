import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatInputStore {
  input: string;
  setInput: (input: string) => void;
}

export const useChatInputStore = create<ChatInputStore>()(
  persist(
    (set) => ({
      input: "",
      setInput: (input) => set({ input }),
    }),
    {
      name: "chat-input",
    },
  ),
);
