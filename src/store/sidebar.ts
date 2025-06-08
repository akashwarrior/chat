import { create } from "zustand"
import { persist } from "zustand/middleware"

type Store = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export const useSidebarStore = create<Store>()(
    persist(
        (set) => ({
            isOpen: false,
            setIsOpen: (isOpen: boolean) => set({ isOpen }),
        }),
        {
            name: 'chat-sidebar',
        }
    )
)