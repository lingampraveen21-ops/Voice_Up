"use client"

import { motion, type TargetAndTransition } from 'framer-motion'

export type NovaState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'correcting'

interface RiveNovaAvatarProps {
    currentState?: NovaState
    className?: string
}

const STATE_CONFIG: Record<NovaState, { gradient: string; glow: string; emoji: string }> = {
    idle: { gradient: 'from-violet-600 to-indigo-600', glow: 'shadow-violet-500/30', emoji: '🤖' },
    listening: { gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/40', emoji: '👂' },
    thinking: { gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/40', emoji: '🧠' },
    speaking: { gradient: 'from-violet-500 to-fuchsia-500', glow: 'shadow-violet-500/40', emoji: '💬' },
    happy: { gradient: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/40', emoji: '✨' },
    correcting: { gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/40', emoji: '📝' },
}

// Framer Motion animation variants per state
const avatarVariants: Record<NovaState, TargetAndTransition> = {
    idle: {
        scale: [1, 1.05, 1],
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    listening: {
        scale: [1, 1.08, 1],
        boxShadow: [
            '0 0 0 0 rgba(16,185,129,0.4)',
            '0 0 0 18px rgba(16,185,129,0)',
            '0 0 0 0 rgba(16,185,129,0.4)',
        ],
        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
    },
    thinking: {
        rotate: [0, 8, -8, 0],
        scale: [1, 1.02, 1],
        transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
    },
    speaking: {
        y: [0, -6, 0],
        scale: [1, 1.06, 1],
        transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },
    happy: {
        scale: [1, 1.2, 1],
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeOut' },
    },
    correcting: {
        scale: [1, 1.04, 1],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
}

export const RiveNovaAvatar = ({ currentState = 'idle', className = "w-32 h-32" }: RiveNovaAvatarProps) => {
    const config = STATE_CONFIG[currentState]

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Outer glow ring */}
            <motion.div
                className="absolute inset-0 rounded-full opacity-40 blur-xl"
                style={{ background: 'radial-gradient(circle, currentColor 0%, transparent 70%)' }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${config.gradient}`} />
            </motion.div>

            {/* Main avatar circle */}
            <motion.div
                className={`relative w-[85%] h-[85%] rounded-full bg-gradient-to-br ${config.gradient} shadow-lg ${config.glow} flex items-center justify-center z-10`}
                animate={avatarVariants[currentState]}
            >
                {/* Inner face area */}
                <div className="w-[75%] h-[75%] rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <span className="text-[clamp(1.2rem,3vw,2.5rem)] select-none">{config.emoji}</span>
                </div>

                {/* Orbiting dots for thinking state */}
                {currentState === 'thinking' && (
                    <>
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-white/80"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                                style={{
                                    top: '10%',
                                    left: '50%',
                                    transformOrigin: `0 ${i === 0 ? '250%' : i === 1 ? '280%' : '220%'}`,
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Sound waves for speaking */}
                {currentState === 'speaking' && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1 rounded-full bg-white/60"
                                animate={{ height: [4, 12, 4] }}
                                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.12 }}
                            />
                        ))}
                    </div>
                )}

                {/* Pulse ring for listening */}
                {currentState === 'listening' && (
                    <motion.div
                        className="absolute inset-[-4px] rounded-full border-2 border-emerald-400/60"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                    />
                )}
            </motion.div>
        </div>
    )
}
