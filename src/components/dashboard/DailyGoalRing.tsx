"use client"

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

export const DailyGoalRing: FC = () => {
    // Mock daily goal values for the grid
    const practicedMin = 18
    const goalMin = 20
    const percentage = Math.min((practicedMin / goalMin) * 100, 100)

    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center hover:border-cyan-500/30 transition-colors group"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] bg-cyan-500/10 blur-[60px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors" />

            <div className="w-full flex justify-between items-start absolute top-6 left-6 right-6 z-10">
                <p className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Daily Goal</p>
                <Target className="w-5 h-5 text-zinc-500" />
            </div>

            <div className="relative w-36 h-36 flex items-center justify-center z-10 mt-6">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Track */}
                    <circle cx="72" cy="72" r={radius} className="fill-none stroke-white/5 stroke-[8]" />
                    {/* Progress */}
                    <motion.circle
                        cx="72" cy="72" r={radius}
                        className="fill-none stroke-cyan-400 stroke-[8] stroke-linecap-round shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                        style={{ strokeDasharray: circumference }}
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black font-heading text-white">{practicedMin}</span>
                    <span className="text-xs text-zinc-400 font-medium">/ {goalMin} min</span>
                </div>
            </div>

        </motion.div>
    )
}
