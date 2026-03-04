import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

interface GreetingCardProps {
    name: string
    streak: number
}

export const GreetingCard: FC<GreetingCardProps> = ({ name, streak }) => {
    const [greeting, setGreeting] = useState("Good day")
    const [currentTime, setCurrentTime] = useState("")

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const hour = now.getHours()

            if (hour < 12) setGreeting("Good morning")
            else if (hour < 18) setGreeting("Good afternoon")
            else setGreeting("Good evening")

            setCurrentTime(format(now, 'h:mm a'))
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
            className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#0f0f1a] to-primary/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none" />

            {/* Left Text */}
            <div className="z-10 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
                    {currentTime} &bull; Dashboard
                </div>
                <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-white mb-2">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{name}</span>! <span className="ml-2 inline-block animate-wave origin-bottom-right">👋</span>
                </h1>
                <p className="text-zinc-400 text-lg flex items-center gap-2">
                    {streak > 0
                        ? <span>Day {streak} streak 🔥 — Keep up the incredible momentum!</span>
                        : <span>Ready to start your VoiceUp journey today?</span>
                    }
                </p>
            </div>

            {/* Right NOVA Avatar (Interactive widget) */}
            <div className="z-10 shrink-0 relative group cursor-pointer border border-white/10 rounded-2xl bg-white/5 p-4 flex items-center gap-4 hover:bg-white/10 transition-colors hidden sm:flex">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    <div className="w-full h-full bg-[#0f0f1a] rounded-full flex items-center justify-center overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-primary/40 animate-pulse" />
                    </div>
                </div>
                <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" /> Ask NOVA</p>
                    <p className="text-xs text-zinc-400 mt-1">Start Voice Chat</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors ml-2 group-hover:translate-x-1" />
            </div>
        </motion.div>
    )
}
