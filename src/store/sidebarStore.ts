import { create } from "zustand"

type Store = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export const useSidebarStore = create<Store>()(
    (set) => ({
        isOpen: false,
        setIsOpen: (isOpen: boolean) => set({ isOpen }),
    }),
)