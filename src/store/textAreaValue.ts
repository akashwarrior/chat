import { create } from "zustand"

type Store = {
    value: string
    setValue: (value: string) => void
}

export const useTextAreaValue = create<Store>()(
    (set) => ({
        value: "",
        setValue: (value: string) => set({ value }),
    }),
)