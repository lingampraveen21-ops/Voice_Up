"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, Bug, MessageSquare, Lightbulb, User, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Category = 'bug' | 'content' | 'suggestion' | 'other'

export function BugReporter() {
    const t = useTranslations("BugReporter")
    const [isOpen, setIsOpen] = useState(false)
    const [category, setCategory] = useState<Category>('bug')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    const categories = [
        { id: 'bug', icon: Bug, label: t("catBug") },
        { id: 'content', icon: MessageSquare, label: t("catContent") },
        { id: 'suggestion', icon: Lightbulb, label: t("catSuggestion") },
        { id: 'other', icon: User, label: t("catOther") },
    ]

    const handleSubmit = async () => {
        if (!description.trim()) return
        setIsSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const browserData = {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                screenSize: `${window.innerWidth}x${window.innerHeight}`
            }

            const { error } = await supabase.from('feedback').insert({
                user_id: user?.id || null, // Allow anonymous bug reports if user not logged in
                type: 'bug_report', // Need to make sure this is handled or use text_feedback mapping
                text_feedback: `[${category.toUpperCase()}] ${description}\n\nMetadata: ${JSON.stringify(browserData)}`
            })

            if (error) throw error

            toast.success(t("success"))
            setIsOpen(false)
            setDescription('')
        } catch (err) {
            console.error(err)
            toast.error("Failed to send report")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-primary shadow-2xl hover:scale-110 active:scale-95 transition-all group"
            >
                <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-sm bg-zinc-950 border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{t("title")}</h3>
                                        <p className="text-xs text-zinc-500">{t("subtitle")}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-zinc-500" />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t("category")}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategory(cat.id as Category)}
                                                className={cn(
                                                    "flex items-center gap-2 p-3 rounded-xl text-xs font-medium transition-all border text-left",
                                                    category === cat.id
                                                        ? "bg-primary/20 border-primary text-primary"
                                                        : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/20"
                                                )}
                                            >
                                                <cat.icon className="w-4 h-4" />
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t("description")}</p>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={t("placeholder")}
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-primary/50 transition-all resize-none"
                                    />
                                </div>

                                <button
                                    disabled={!description.trim() || isSubmitting}
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "..." : <><Send className="w-4 h-4" /> {t("submit")}</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
