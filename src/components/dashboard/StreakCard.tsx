import { FC } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import CountUp from 'react-countup'

interface StreakCardProps {
    streak: number
    freezeAvailable: boolean
}

import { useTranslations } from 'next-intl'

export const StreakCard: FC<StreakCardProps> = ({ streak, freezeAvailable }) => {
    const t = useTranslations("Dashboard")
    // Determine weekly dots based on streak (mocked past 7 days logic for visual)
    const days = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')]
    const filledCount = Math.min(streak, 7)
    const activeDays = Array.from({ length: 7 }).map((_, i) => i < filledCount)

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between h-full"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] pointer-events-none group-hover:bg-orange-500/20 transition-colors" />

            <div className="flex items-start justify-between mb-4 z-10">
                <div>
                    <p className="text-zinc-400 font-medium text-sm mb-1 uppercase tracking-wider">{t("currentStreak")}</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black font-heading text-white drop-shadow-lg">
                            <CountUp end={streak} duration={2} />
                        </h2>
                        <span className="text-zinc-400 font-medium tracking-wide">{t("daysLabel")}</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                </div>
            </div>

            <div className="z-10 mt-4">
                <div className="flex justify-between items-center mb-2">
                    {days.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] text-zinc-500 font-medium">{d}</span>
                            <div className={`w-3 h-3 rounded-full transition-colors ${activeDays[i] ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-white/5 border border-white/10'}`} />
                        </div>
                    ))}
                </div>

                {freezeAvailable && (
                    <div className="mt-4 text-xs inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg font-medium">
                        <span className="text-cyan-300">🧊</span> {t("freezeAvailable")}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
