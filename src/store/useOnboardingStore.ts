import { create } from 'zustand'

interface OnboardingState {
    goal: string | null
    timeCommitment: string | null
    interviewDate: Date | null
    setGoal: (goal: string) => void
    setTimeCommitment: (time: string) => void
    setInterviewDate: (date: Date | null) => void
    reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    goal: null,
    timeCommitment: null,
    interviewDate: null,
    setGoal: (goal) => set({ goal }),
    setTimeCommitment: (timeCommitment) => set({ timeCommitment }),
    setInterviewDate: (interviewDate) => set({ interviewDate }),
    reset: () => set({ goal: null, timeCommitment: null, interviewDate: null }),
}))
