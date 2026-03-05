"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mic, Square, Loader2, Sparkles, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { GradientButton } from '@/components/ui/GradientButton'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { createClient } from '@/lib/supabase/client'

const CHALLENGE_CONFIG: Record<string, { name: string, time: number, prompts: string[], xp: number }> = {
    '30s': {
        name: 'Quick Spark', time: 30, xp: 20,
        prompts: ["What is your favorite book and why?", "Describe your perfect weekend.", "What is the best advice you've ever received?", "If you could travel anywhere, where would you go?"]
    },
    '60s': {
        name: 'Speed Talk', time: 60, xp: 40,
        prompts: ["Explain the importance of learning new languages.", "Describe a challenge you recently overcame.", "How do you think technology will change education?", "What are the qualities of a good leader?"]
    },
    '2m': {
        name: 'Power Pitch', time: 120, xp: 60,
        prompts: ["Pitch a revolutionary app idea that solves a modern problem.", "Explain the concept of 'climate change' to a middle schooler.", "Defend the pros and cons of remote work.", "Describe how generative AI will impact the creative industry."]
    },
    '5m': {
        name: 'Deep Dive', time: 300, xp: 100,
        prompts: ["Give a comprehensive overview of your professional field, its current challenges, and its future outlook.", "Discuss the ethical implications of artificial intelligence in modern society.", "Analyze the impact of social media on interpersonal communication and mental health over the last decade."]
    }
}

interface GradeResult {
    fluency: number
    grammar: number
    vocabulary: number
    overall: number
    feedback: string
}

export default function TimedChallengePage({ params }: { params: { type: string } }) {
    const router = useRouter()
    const config = CHALLENGE_CONFIG[params.type]
    const supabase = createClient()

    const [prompt, setPrompt] = useState("")
    const [timeLeft, setTimeLeft] = useState(config?.time || 0)
    const [hasStarted, setHasStarted] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [isGrading, setIsGrading] = useState(false)
    const [result, setResult] = useState<GradeResult | null>(null)

    const { transcript, startRecording, stopRecording } = useVoiceRecorder()

    useEffect(() => {
        if (!config) {
            router.push('/challenges')
            return
        }
        // Pick random prompt
        setPrompt(config.prompts[Math.floor(Math.random() * config.prompts.length)])
    }, [config, router])

    const handleStart = () => {
        setHasStarted(true)
        startRecording()
    }

    const handleStop = useCallback(async () => {
        stopRecording()
        setIsFinished(true)
        setIsGrading(true)

        try {
            // Grade using Gemini endpoint (to be created)
            const res = await fetch('/api/grade-speaking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript, expectedTopic: prompt })
            })

            if (!res.ok) throw new Error("Failed to grade")
            const data = await res.json()
            setResult(data)

            // Save session to Supabase
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('sessions').insert({
                    user_id: user.id,
                    activity_type: `challenge_${params.type}`,
                    score: data.overall,
                    duration: config.time - timeLeft,
                    transcript: transcript
                })

                // Add XP (simulate via RPC or manual profile update)
                // For safety we can update profiles natively here if RPC isn't available
                const { data: profile, error: profileErr } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
                if (profileErr && profileErr.code === 'PGRST116') {
                    // Profile doesn't exist yet, create with initial XP
                    await supabase.from('profiles').upsert({
                        id: user.id,
                        xp: config.xp,
                        created_at: new Date().toISOString(),
                    })
                } else if (profile) {
                    await supabase.from('profiles').update({ xp: (profile.xp || 0) + config.xp }).eq('id', user.id)
                }
            }

            if (data.overall >= 70) {
                confetti({ particleCount: 150, zIndex: 100 })
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to process your speaking response.")
        } finally {
            setIsGrading(false)
        }
    }, [stopRecording, transcript, prompt, supabase, params.type, config, timeLeft])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (hasStarted && !isFinished && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
        } else if (timeLeft === 0 && hasStarted && !isFinished) {
            handleStop()
        }
        return () => clearInterval(timer)
    }, [hasStarted, timeLeft, isFinished, handleStop])

    if (!config) return null

    return (
        <div className="min-h-screen bg-[#080810] text-white flex flex-col p-4 md:p-8">
            <header className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full">
                <button onClick={() => router.push('/challenges')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-bold">{config.name}</h1>
                    <p className="text-sm text-zinc-500 font-mono tracking-widest">{config.time} SECONDS</p>
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {!isFinished ? (
                        <motion.div
                            key="challenge"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full flex flex-col items-center text-center"
                        >
                            <div className="mb-12 relative">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                    <motion.circle
                                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent"
                                        className={`${timeLeft < 10 ? 'text-rose-500' : 'text-primary'}`}
                                        strokeDasharray={2 * Math.PI * 88}
                                        initial={{ strokeDashoffset: 0 }}
                                        animate={{ strokeDashoffset: ((config.time - timeLeft) / config.time) * (2 * Math.PI * 88) }}
                                        transition={{ duration: 1, ease: "linear" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-5xl font-mono font-black ${timeLeft < 10 ? 'text-rose-400' : 'text-white'}`}>
                                        {timeLeft}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold mb-12 min-h-[100px] flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-white text-balance leading-relaxed">
                                &quot;{prompt}&quot;
                            </h2>

                            <div className="w-full h-32 bg-white/5 rounded-2xl p-4 mb-8 overflow-y-auto border border-white/10 relative">
                                {!hasStarted && <div className="absolute inset-0 flex items-center justify-center text-zinc-500">Press start to record</div>}
                                <p className="text-zinc-300 relative z-10">{transcript}</p>
                            </div>

                            {!hasStarted ? (
                                <GradientButton onClick={handleStart} className="px-12 py-4 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                                    Start Challenge <Mic className="w-5 h-5 ml-2" />
                                </GradientButton>
                            ) : (
                                <button
                                    onClick={handleStop}
                                    className="px-12 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/50 rounded-xl font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse"
                                >
                                    Finish Early <Square className="w-5 h-5 fill-current" />
                                </button>
                            )}
                        </motion.div>
                    ) : isGrading ? (
                        <motion.div
                            key="grading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-2">Analyzing your response</h2>
                            <p className="text-zinc-400 max-w-sm">NOVA is evaluating your pronunciation, vocabulary consistency, and sentence structures...</p>
                        </motion.div>
                    ) : result ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full bg-gradient-to-br from-[#1a150f] to-[#0f0f1a] border border-amber-500/30 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none" />

                            <Award className={`w-20 h-20 mx-auto mb-6 ${result.overall >= 80 ? 'text-amber-400' : 'text-zinc-400'}`} />
                            <h2 className="text-4xl font-black mb-2">{result.overall}%</h2>
                            <p className="text-xs tracking-widest uppercase font-bold text-amber-500 mb-8">+ {config.xp} XP Earned</p>

                            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Fluency</p>
                                    <p className="text-xl font-bold text-white">{result.fluency}/100</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Grammar</p>
                                    <p className="text-xl font-bold text-white">{result.grammar}/100</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Vocab</p>
                                    <p className="text-xl font-bold text-white">{result.vocabulary}/100</p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left mb-8">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-2"><Sparkles className="w-4 h-4 text-primary" /> NOVA Feedback</h4>
                                <p className="text-zinc-300 text-sm leading-relaxed">{result.feedback}</p>
                            </div>

                            <GradientButton onClick={() => router.push('/challenges')} className="px-8 py-3 w-full">
                                Return to Arena
                            </GradientButton>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </main>
        </div>
    )
}
