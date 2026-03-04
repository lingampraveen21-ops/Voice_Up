import { create } from 'zustand'

interface FeedbackState {
    isOpen: boolean
    sessionId: string | null
    type: 'session' | 'nps' | 'bug'
    openFeedback: (sessionId?: string | null, type?: 'session' | 'nps' | 'bug') => void
    closeFeedback: () => void
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
    isOpen: false,
    sessionId: null,
    type: 'session',
    openFeedback: (sessionId = null, type = 'session') => set({ isOpen: true, sessionId, type }),
    closeFeedback: () => set({ isOpen: false, sessionId: null })
}))
