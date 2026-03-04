"use client"

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { RiveNovaAvatar } from '@/components/ui/RiveNovaAvatar'

interface NovaSuggestionCardProps {
    scores: {
        reading: number
        writing: number
        listening: number
        speaking: number
    }
}

import { useTranslations } from 'next-intl'

export const NovaSuggestionCard: FC<NovaSuggestionCardProps> = ({ scores }) => {
    const t = useTranslations("Dashboard")
    // Determine personalized message based on the lowest scoring skill
    const minScore = Math.min(scores.reading, scores.writing, scores.listening, scores.speaking)

    let suggestion = t("suggestionDefault")
    let actionText = t("actionDefault")

    if (minScore === scores.writing) {
        suggestion = t("suggestionWriting")
        actionText = t("actionWriting")
    } else if (minScore === scores.speaking) {
        suggestion = t("suggestionSpeaking")
        actionText = t("actionSpeaking")
    } else if (minScore === scores.listening) {
        suggestion = t("suggestionListening")
        actionText = t("actionListening")
    } else if (minScore === scores.reading) {
        suggestion = t("suggestionReading")
        actionText = t("actionReading")
    }

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="bg-gradient-to-br from-primary/10 to-[#0f0f1a] border border-primary/20 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between h-full"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] pointer-events-none" />

            <div className="flex items-start gap-4 z-10 mb-4">
                <RiveNovaAvatar currentState="happy" className="w-12 h-12 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" /> {t("novaSuggests")}</p>
                    <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                        &quot;{suggestion}&quot;
                    </p>
                </div>
            </div>

            <button className="z-10 mt-auto w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-sm font-bold text-white transition-colors group-hover:border-primary/50">
                {actionText} <ArrowRight className="w-4 h-4 text-primary" />
            </button>

        </motion.div>
    )
}
