import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { RiveNovaAvatar } from '@/components/ui/RiveNovaAvatar'
import { useRouter } from 'next/navigation'

interface GreetingCardProps {
    name: string
    streak: number
}

import { useTranslations } from 'next-intl'

export const GreetingCard: FC<GreetingCardProps> = ({ name, streak }) => {
    const router = useRouter()
    const t = useTranslations("Dashboard")
    const [timeOfDayKey, setTimeOfDayKey] = useState("welcome")
    const [currentTime, setCurrentTime] = useState("")

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const hour = now.getHours()

            if (hour < 12) setTimeOfDayKey("morning")
            else if (hour < 18) setTimeOfDayKey("afternoon")
            else setTimeOfDayKey("evening")

            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }

        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#0f0f1a] to-primary/5 border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6"
        >
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none" />

            {/* Left Text */}
            <div className="z-10 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
                    {currentTime} &bull; {t("dashboardLabel")}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black font-heading tracking-tight text-white mb-2">
                    {t("greeting", { timeOfDay: t(timeOfDayKey), name })} <span className="ml-2 inline-block animate-wave origin-bottom-right">👋</span>
                </h1>
                <p className="text-zinc-400 text-lg flex items-center gap-2">
                    {streak > 0
                        ? <span>{t("streakStatus", { days: streak })}</span>
                        : <span>{t("noStreakStatus")}</span>
                    }
                </p>
            </div>

            {/* Right NOVA Avatar (Interactive widget) */}
            <div
                onClick={() => router.push('/practice/speaking')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') router.push('/practice/speaking') }}
                className="z-10 shrink-0 relative group cursor-pointer border border-white/10 rounded-2xl bg-white/5 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-white/10 transition-colors"
            >
                <RiveNovaAvatar currentState="idle" className="w-10 h-10 sm:w-16 sm:h-16 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" /> {t("askNova")}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t("startVoiceChat")}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors ml-2 group-hover:translate-x-1" />
            </div>
        </motion.div>
    )
}
