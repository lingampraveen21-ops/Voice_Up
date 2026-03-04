"use client"

import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Timer, Trophy, Mic } from 'lucide-react'
import { GradientButton } from '../ui/GradientButton'

export const ChallengeCard: FC = () => {
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        // Calculate hours left until midnight
        const updateCountdown = () => {
            const now = new Date()
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
            const diff = endOfDay.getTime() - now.getTime()

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
            const m = Math.floor((diff / 1000 / 60) % 60)
            const s = Math.floor((diff / 1000) % 60)

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
        }

        updateCountdown()
        const timer = setInterval(updateCountdown, 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="md:col-span-2 bg-gradient-to-br from-[#1a150f] to-[#0f0f1a] border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between h-full"
        >
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none group-hover:bg-amber-500/20 transition-colors" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 mb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Trophy className="w-3 h-3" /> Daily Challenge
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-white">The Elevator Pitch</h3>
                    <p className="text-sm text-zinc-400 mt-1">Record a 30-second introduction targeting recruiters.</p>
                </div>

                <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl font-mono text-amber-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <Timer className="w-4 h-4" /> {timeLeft}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#1a150f] flex items-center justify-center text-xs font-bold ${i === 1 ? 'bg-amber-400 text-black z-30' : i === 2 ? 'bg-zinc-300 text-black z-20' : 'bg-orange-700 text-white z-10'
                                }`}>
                                {i}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-zinc-400 ml-2 whitespace-nowrap">Current Rank: <span className="text-white font-bold">Unranked</span></p>
                </div>

                <GradientButton className="w-full md:w-auto flex items-center gap-2 px-6 py-3 whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400">
                    Accept Challenge <Mic className="w-4 h-4" />
                </GradientButton>
            </div>
        </motion.div>
    )
}
