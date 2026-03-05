"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFeedbackStore } from '@/store/useFeedbackStore'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function NPSSurvey() {
    const t = useTranslations("NPS")
    const { isOpen, closeFeedback, type } = useFeedbackStore()
    const [score, setScore] = useState<number | null>(null)
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const supabase = createClient()

    if (!isOpen || type !== 'nps') return null

    const handleSubmit = async () => {
        if (score === null) return
        setIsSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase.from('feedback').insert({
                user_id: user.id,
                nps_score: score,
                text_feedback: reason
            })

            if (error) throw error

            setIsSubmitted(true)
            localStorage.setItem('nps_completed', 'true')
            toast.success("Thank you for your response!")
            setTimeout(() => {
                closeFeedback()
            }, 2000)
        } catch (err) {
            console.error(err)
            toast.error("Failed to submit response")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-zinc-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full relative"
                    >
                        <button
                            onClick={closeFeedback}
                            className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {!isSubmitted ? (
                            <>
                                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                                    <Trophy className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{t("title")}</h3>
                                <p className="text-zinc-400 mb-8">{t("subtitle")}</p>

                                <div className="flex justify-between gap-1 mb-10">
                                    {[...Array(11)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setScore(i)}
                                            className={cn(
                                                "flex-1 py-3 rounded-lg text-sm font-bold transition-all border",
                                                score === i
                                                    ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
                                                    : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/30"
                                            )}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-8 px-1">
                                    <span>{t("low")}</span>
                                    <span>{t("high")}</span>
                                </div>

                                <p className="text-sm font-medium text-white mb-3">{t("reason")}</p>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-primary/50 transition-all mb-8 resize-none"
                                />

                                <button
                                    disabled={score === null || isSubmitting}
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isSubmitting ? "..." : t("submit")}
                                </button>
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-6xl mb-6"
                                >
                                    🏆
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-2">Awesome!</h3>
                                <p className="text-zinc-400">Thanks for helping us make VoiceUp better.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
