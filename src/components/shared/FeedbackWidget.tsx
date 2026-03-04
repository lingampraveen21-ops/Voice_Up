"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFeedbackStore } from '@/store/useFeedbackStore'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const EMOJIS = [
    { value: 1, symbol: '😞' },
    { value: 2, symbol: '😐' },
    { value: 3, symbol: '🙂' },
    { value: 4, symbol: '😄' },
    { value: 5, symbol: '🤩' },
]

export function FeedbackWidget() {
    const t = useTranslations("Feedback")
    const { isOpen, sessionId, closeFeedback, type } = useFeedbackStore()
    const [rating, setRating] = useState<number | null>(null)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const supabase = createClient()

    if (!isOpen || type !== 'session') return null

    const handleSubmit = async () => {
        if (!rating) return
        setIsSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase.from('feedback').insert({
                user_id: user.id,
                session_id: sessionId,
                emoji_rating: rating,
                text_feedback: comment
            })

            if (error) throw error

            setIsSubmitted(true)
            toast.success(t("thanks"))
            setTimeout(() => {
                handleClose()
            }, 2000)
        } catch (err) {
            console.error(err)
            toast.error("Failed to submit feedback")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setIsSubmitted(false)
        setRating(null)
        setComment('')
        closeFeedback()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 right-6 z-[60] w-full max-w-sm"
                >
                    <div className="glass-morphism border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {!isSubmitted ? (
                            <>
                                <h3 className="text-lg font-bold text-white mb-1">{t("title")}</h3>
                                <p className="text-xs text-zinc-400 mb-6">{t("subtitle")}</p>

                                <div className="flex justify-between mb-6">
                                    {EMOJIS.map((e) => (
                                        <button
                                            key={e.value}
                                            onClick={() => setRating(e.value)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-2 rounded-2xl transition-all",
                                                rating === e.value ? "bg-primary/20 scale-110" : "hover:bg-white/5"
                                            )}
                                        >
                                            <span className="text-2xl">{e.symbol}</span>
                                            <span className={cn(
                                                "text-[10px] font-medium transition-colors",
                                                rating === e.value ? "text-primary" : "text-zinc-500"
                                            )}>
                                                {t(`label${e.value}`)}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={t("placeholder")}
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-primary/50 transition-all mb-4 resize-none"
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 py-3 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {t("skip")}
                                    </button>
                                    <button
                                        disabled={!rating || isSubmitting}
                                        onClick={handleSubmit}
                                        className="flex-[2] py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? "..." : <><Send className="w-4 h-4" /> {t("submit")}</>}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-10 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-4xl mb-4"
                                >
                                    ❤️
                                </motion.div>
                                <p className="text-sm font-medium text-white">{t("thanks")}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
