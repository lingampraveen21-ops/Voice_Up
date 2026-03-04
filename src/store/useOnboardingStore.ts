import { create } from 'zustand'

interface OnboardingState {
    goal: string | null
    timeCommitment: string | null
    interviewDate: Date | undefined
    setGoal: (goal: string) => void
    setTimeCommitment: (time: string) => void
    setInterviewDate: (date: Date | undefined) => void
    reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    goal: null,
    timeCommitment: null,
    interviewDate: undefined,
    setGoal: (goal) => set({ goal }),
    setTimeCommitment: (timeCommitment) => set({ timeCommitment }),
    setInterviewDate: (interviewDate) => set({ interviewDate }),
    reset: () => set({ goal: null, timeCommitment: null, interviewDate: undefined }),
}))
