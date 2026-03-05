"use client"

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Flame, Star, Trophy, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useTranslations } from 'next-intl'

export const BadgesRow: FC = () => {
    const router = useRouter()
    const t = useTranslations("Dashboard")
    // Mock badges for the row
    const badges = [
        { id: 1, icon: Flame, title: t("badgeStreak", { days: 3 }), earned: true, color: "text-orange-500", bg: "bg-orange-500/20 border-orange-500/30" },
        { id: 2, icon: Zap, title: t("badgeLearner"), earned: true, color: "text-amber-400", bg: "bg-amber-400/20 border-amber-400/30" },
        { id: 3, icon: Shield, title: t("badgePerfect"), earned: true, color: "text-emerald-400", bg: "bg-emerald-400/20 border-emerald-400/30" },
        { id: 4, icon: Star, title: t("badgeXP", { amount: 1000 }), earned: false, color: "text-zinc-600", bg: "bg-white/5 border-white/10" },
        { id: 5, icon: Trophy, title: t("badgePlacement"), earned: false, color: "text-zinc-600", bg: "bg-white/5 border-white/10" },
    ]

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-heading text-white">{t("recentBadges")}</h3>
                <button onClick={() => router.push('/progress')} className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:text-primary-light transition-colors group">
                    {t("viewAll")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                {badges.some(b => b.earned) ? (
                    badges.map((b) => {
                        const Icon = b.icon
                        return (
                            <div
                                key={b.id}
                                className={`snap-start shrink-0 w-32 h-32 rounded-2xl border flex flex-col items-center justify-center p-4 text-center transition-all ${b.bg} ${b.earned ? 'hover:scale-105' : 'opacity-50 grayscale'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                                    <Icon className={`w-6 h-6 ${b.color} ${b.earned ? 'drop-shadow-[0_0_10px_currentColor]' : ''}`} />
                                </div>
                                <p className={`text-xs font-bold leading-tight ${b.earned ? 'text-white' : 'text-zinc-500'}`}>
                                    {b.title}
                                </p>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex-1 flex justify-center py-4">
                        <p className="text-zinc-500 text-sm">Complete your first lesson to earn one!</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
