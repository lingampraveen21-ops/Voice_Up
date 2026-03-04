import { create } from 'zustand'

export interface Correction {
    original: string
    corrected: string
    explanation?: string
}

export interface Message {
    role: 'user' | 'nova'
    content: string
}

interface NovaState {
    isListening: boolean
    isSpeaking: boolean
    isThinking: boolean
    transcript: string
    novaMessage: string
    correction: Correction | null
    sessionScore: number
    mistakes: Correction[]
    conversationHistory: Message[]

    // Actions
    setListening: (listening: boolean) => void
    setSpeaking: (speaking: boolean) => void
    setThinking: (thinking: boolean) => void
    setTranscript: (text: string) => void
    setNovaMessage: (text: string) => void
    setCorrection: (correction: Correction | null) => void
    addMistake: (correction: Correction) => void
    updateSessionScore: (points: number) => void
    addMessageToHistory: (message: Message) => void
    resetSession: () => void
}

export const useNovaStore = create<NovaState>((set) => ({
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    transcript: '',
    novaMessage: '',
    correction: null,
    sessionScore: 100, // Start at 100, deduct for mistakes
    mistakes: [],
    conversationHistory: [],

    setListening: (listening) => set({ isListening: listening }),
    setSpeaking: (speaking) => set({ isSpeaking: speaking }),
    setThinking: (thinking) => set({ isThinking: thinking }),
    setTranscript: (text) => set({ transcript: text }),
    setNovaMessage: (text) => set({ novaMessage: text }),
    setCorrection: (correction) => set({ correction }),
    addMistake: (correction) => set((state) => ({ mistakes: [...state.mistakes, correction] })),
    updateSessionScore: (points) => set((state) => ({ sessionScore: Math.max(0, state.sessionScore + points) })),
    addMessageToHistory: (message) => set((state) => ({ conversationHistory: [...state.conversationHistory, message] })),
    resetSession: () => set({
        isListening: false,
        isSpeaking: false,
        isThinking: false,
        transcript: '',
        novaMessage: '',
        correction: null,
        sessionScore: 100,
        mistakes: [],
        conversationHistory: []
    })
}))
