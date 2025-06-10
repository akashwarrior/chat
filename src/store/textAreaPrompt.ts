import { create } from "zustand"

type Store = {
    prompt: string
    setPrompt: (prompt: string) => void
}

export const useTextAreaPrompt = create<Store>()(
    (set) => ({
        prompt: "",
        setPrompt: (prompt: string) => set({ prompt }),
    }),
)