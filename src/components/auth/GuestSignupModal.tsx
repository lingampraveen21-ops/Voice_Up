"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/useAuthStore"
import { Sparkles, X, ArrowRight } from "lucide-react"
import { GradientButton } from "@/components/ui/GradientButton"
import { GhostButton } from "@/components/ui/GhostButton"

export function GuestSignupModal() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { isGuest, user, setGuest } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        // Show modal if the user is a guest and hits lesson 2.
        // They cannot progress to lesson 3 because middleware protects it.
        if (isGuest && !user && pathname === '/learn/lesson-2') {
            const timer = setTimeout(() => setIsOpen(true), 3000) // Delay modal slightly for UX
            return () => clearTimeout(timer)
        } else {
            setIsOpen(false)
        }
    }, [pathname, isGuest, user])

    const handleClose = () => {
        setIsOpen(false)
    }

    const handleSignupRedirect = () => {
        setGuest(false)
        router.push('/signup')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0 pointer-events-none">
                    {/* Backdrop blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-md bg-[#0f0f1a] border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                    >
                        {/* Background glowing blobs */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 blur-[60px] rounded-full" />

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>

                            <h2 className="text-2xl font-bold font-heading text-white mb-2">
                                Save your progress!
                            </h2>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                You&apos;re making great progress! Sign up for a free VoiceUp account to save your lessons, unlock all practice modes, and track your daily streak.
                            </p>

                            <div className="w-full space-y-3">
                                <GradientButton onClick={handleSignupRedirect} className="w-full py-6 group">
                                    Sign up free <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </GradientButton>
                                <GhostButton onClick={handleClose} className="w-full text-zinc-400 hover:text-white hover:bg-white/5">
                                    Maybe later
                                </GhostButton>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
