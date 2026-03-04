"use client"

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

interface NovaSuggestionCardProps {
    scores: {
        reading: number
        writing: number
        listening: number
        speaking: number
    }
}

export const NovaSuggestionCard: FC<NovaSuggestionCardProps> = ({ scores }) => {
    // Determine personalized message based on the lowest scoring skill
    const minScore = Math.min(scores.reading, scores.writing, scores.listening, scores.speaking)

    let suggestion = "Ready for today's lesson? Let's keep the momentum going!"
    let actionText = "Start Lesson"

    if (minScore === scores.writing) {
        suggestion = "I noticed your Writing score could use a boost. Try a writing exercise today!"
        actionText = "Practice Writing"
    } else if (minScore === scores.speaking) {
        suggestion = "Let's work on your pronunciation today. Your speaking skills are close to a breakthrough!"
        actionText = "Speaking Lab"
    } else if (minScore === scores.listening) {
        suggestion = "Listening comprehension is key. I've queued up an audio challenge for you."
        actionText = "Audio Challenge"
    } else if (minScore === scores.reading) {
        suggestion = "Taking some time to read structural English will significantly raise your baseline."
        actionText = "Read Article"
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shadow-[0_0_15px_rgba(168,85,247,0.4)] shrink-0">
                    <div className="w-full h-full bg-[#0f0f1a] rounded-full flex items-center justify-center overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-primary/40 animate-pulse" />
                    </div>
                </div>
                <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" /> NOVA Suggests</p>
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
