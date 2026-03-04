import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
    user: User | null
    session: Session | null
    isLoading: boolean
    isGuest: boolean
    setAuth: (user: User | null, session: Session | null) => void
    setLoading: (isLoading: boolean) => void
    setGuest: (isGuest: boolean) => void
    signOut: () => Promise<void>
    initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    isGuest: typeof window !== 'undefined' ? localStorage.getItem('isGuest') === 'true' : false,

    setAuth: (user, session) => set({ user, session, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
    setGuest: (isGuest) => {
        if (typeof window !== 'undefined') {
            if (isGuest) {
                localStorage.setItem('isGuest', 'true')
            } else {
                localStorage.removeItem('isGuest')
            }
        }
        set({ isGuest })
    },

    signOut: async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        set({ user: null, session: null, isGuest: false })
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isGuest')
        }
    },

    initialize: async () => {
        const supabase = createClient()

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        set({ user: session?.user ?? null, session, isLoading: false })

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, session, isLoading: false })
        })
    }
}))
