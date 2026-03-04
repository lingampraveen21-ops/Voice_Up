"use client"

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Rocket, PlayCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GradientButton } from '../ui/GradientButton'

import { useTranslations } from 'next-intl'

export const ContinueLearningCard: FC = () => {
    const router = useRouter()
    const t = useTranslations("Dashboard")
    // Hardcoded for presentation; could fetch "last_incomplete_lesson" from Supabase realistically
    // Mock data check (replace with real data from props or store)
    const hasStartedLessons = true // This should be dynamic

    if (!hasStartedLessons) {
        return (
            <motion.div
                variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1 }
                }}
                className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#0f0f1a] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                    <Rocket className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to start your journey?</h3>
                <p className="text-zinc-400 text-sm mb-6 max-w-md">You haven't started any lessons yet. NOVA recommends beginning with "Mastering Introductions".</p>
                <GradientButton onClick={() => router.push('/learn')} className="px-8 py-4">
                    Start Your First Lesson →
                </GradientButton>
            </motion.div>
        )
    }

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[100px] bg-secondary/10 blur-[80px] pointer-events-none" />

            <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-secondary/20 border border-secondary/20 flex items-center justify-center shrink-0">
                    <Rocket className="w-8 h-8 text-secondary drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                </div>
                <div className="flex-1">
                    <div className="inline-flex px-2 py-0.5 rounded-full bg-secondary/10 text-[10px] font-bold tracking-wider text-secondary uppercase mb-2">
                        {t("inProgress")}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold font-heading text-white mb-1">Advanced Phrasal Verbs</h3>
                    <p className="text-sm text-zinc-400">{t("lesson", { number: 4 })} &middot; {t("remaining", { amount: 15 })}</p>
                </div>
            </div>

            <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                <div className="hidden md:flex flex-col gap-2 w-48">
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                        <span>{t("progressLabel")}</span>
                        <span className="text-white">65%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-secondary shadow-[0_0_10px_currentColor] shadow-secondary/50"
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </div>
                </div>

                <GradientButton className="w-full md:w-auto px-6 py-4 flex items-center gap-2 group">
                    <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> {t("continue")}
                </GradientButton>
            </div>
        </motion.div>
    )
}
