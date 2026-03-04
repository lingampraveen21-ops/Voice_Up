"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, Trophy, ArrowRight, BookOpen, Headphones, Mic, Edit3 } from "lucide-react"
import { GradientButton } from "@/components/ui/GradientButton"
import CountUp from "react-countup"
import confetti from "canvas-confetti"

export default function PlacementResultsPage() {
    const router = useRouter()
    const supabase = createClient()

    const [scores, setScores] = useState({
        total: 0,
        cefr: "A1",
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fire confetti immediately
        const duration = 3000
        const end = Date.now() + duration

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#a855f7', '#ec4899', '#3b82f6']
            })
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#a855f7', '#ec4899', '#3b82f6']
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }
        frame()

        const fetchScores = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                if (data) {
                    setScores({
                        total: data.voiceup_score || 0,
                        cefr: data.cefr_level || 'A1',
                        reading: data.reading_score || 0,
                        writing: data.writing_score || 0,
                        listening: data.listening_score || 0,
                        speaking: data.speaking_score || 0
                    })
                }
            }
            setLoading(false)
        }

        fetchScores()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleStartJourney = () => {
        router.push('/dashboard')
    }

    const skillBars = [
        { name: "Reading", icon: BookOpen, score: scores.reading, color: "bg-blue-500", glow: "shadow-blue-500/50" },
        { name: "Listening", icon: Headphones, score: scores.listening, color: "bg-purple-500", glow: "shadow-purple-500/50" },
        { name: "Speaking", icon: Mic, score: scores.speaking, color: "bg-rose-500", glow: "shadow-rose-500/50" },
        { name: "Writing", icon: Edit3, score: scores.writing, color: "bg-emerald-500", glow: "shadow-emerald-500/50" },
    ]

    if (loading) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#080810] text-white flex flex-col items-center py-12 px-4 relative overflow-x-hidden">
            {/* Background glow bursts */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/20 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8 relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    Test Complete
                </div>
                <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight mb-4">
                    Your English Level
                </h1>
                <p className="text-zinc-400 max-w-lg mx-auto text-lg">
                    We&apos;ve analyzed your responses and tailored your personalized learning roadmap.
                </p>
            </motion.div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">

                {/* Left Col: Main CEFR Score */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center justify-center bg-[#0f0f1a] border border-white/10 rounded-3xl p-10 relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                        <Trophy className="w-10 h-10 text-primary" />
                    </div>

                    <p className="text-zinc-400 font-medium mb-2 uppercase tracking-widest text-sm">CEFR Level</p>
                    <div className="text-7xl font-black font-heading bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
                        {scores.cefr}
                    </div>

                    <div className="flex items-center gap-4 text-sm font-mono text-zinc-500">
                        VoiceUp Score:
                        <span className="text-2xl text-white font-bold ml-2">
                            <CountUp end={scores.total} duration={2.5} />
                        </span>
                        / 100
                    </div>
                </motion.div>

                {/* Right Col: Skill Breakdown */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col justify-center bg-[#0f0f1a] border border-white/10 rounded-3xl p-8"
                >
                    <h3 className="text-xl font-bold font-heading mb-6 border-b border-white/10 pb-4">Skill Analysis</h3>

                    <div className="space-y-6">
                        {skillBars.map((skill, i) => {
                            const Icon = skill.icon
                            return (
                                <div key={skill.name}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2 text-zinc-300 font-medium">
                                            <Icon className="w-4 h-4 text-zinc-500" /> {skill.name}
                                        </div>
                                        <div className="text-sm font-mono text-zinc-400">
                                            <CountUp end={skill.score} duration={2} delay={0.5 + i * 0.1} /> / 25
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(skill.score / 25) * 100}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 + i * 0.2, ease: "easeOut" }}
                                            className={`h-full ${skill.color} shadow-[0_0_10px_currentColor] ${skill.glow}`}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 z-10"
            >
                <GradientButton onClick={handleStartJourney} className="px-12 py-6 text-lg group">
                    Start My Journey
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </GradientButton>
            </motion.div>
        </div>
    )
}
