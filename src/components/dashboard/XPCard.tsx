"use client"

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import CountUp from 'react-countup'

interface XPCardProps {
    xp: number
}

export const XPCard: FC<XPCardProps> = ({ xp }) => {
    // Simple logic to derive rank
    let rank = "Beginner"
    if (xp > 500) rank = "Learner"
    if (xp > 2000) rank = "Speaker"
    if (xp > 5000) rank = "Fluent"
    if (xp > 10000) rank = "Master"

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between h-full hover:border-emerald-500/30 transition-colors"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />

            <div className="flex items-start justify-between z-10">
                <div>
                    <p className="text-zinc-400 font-medium text-sm mb-1 uppercase tracking-wider">Total Experience</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black font-heading text-white drop-shadow-lg">
                            <CountUp end={xp} duration={2} />
                        </h2>
                        <span className="text-zinc-400 font-medium tracking-wide">XP</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </div>
            </div>

            <div className="mt-6 z-10 flex items-center justify-between">
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-zinc-300">
                    Rank: <span className="text-white">{rank}</span>
                </div>
                <p className="text-sm font-bold text-emerald-400">+150 Today</p>
            </div>

        </motion.div>
    )
}
