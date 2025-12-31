import { atomWithStorage } from 'jotai/utils'

export const chatInputAtom = atomWithStorage<string>('chatInput', '')