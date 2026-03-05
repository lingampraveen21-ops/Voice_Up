"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mic, Square, Loader2, Sparkles, Trophy, CalendarDays, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { GradientButton } from '@/components/ui/GradientButton'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { createClient } from '@/lib/supabase/client'

interface GradeResult {
    fluency: number
    grammar: number
    vocabulary: number
    overall: number
    feedback: string
}

export default function DailyChallengePage() {
    const router = useRouter()
    const supabase = createClient()

    const [prompt, setPrompt] = useState("")
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(true)
    const [timeLeft, setTimeLeft] = useState(120) // 2 Min fixed for Daily
    const [hasStarted, setHasStarted] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [isGrading, setIsGrading] = useState(false)
    const [result, setResult] = useState<GradeResult | null>(null)
    const [alreadyCompleted, setAlreadyCompleted] = useState(false)

    const { transcript, startRecording, stopRecording } = useVoiceRecorder()

    useEffect(() => {
        const fetchDaily = async () => {
            try {
                // Check if user already did today's challenge
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const today = new Date().toISOString().split('T')[0]
                    const { data: session } = await supabase
                        .from('sessions')
                        .select('score')
                        .eq('user_id', user.id)
                        .eq('activity_type', 'daily_challenge')
                        .gte('created_at', today)
                        .limit(1)

                    if (session && session.length > 0) {
                        setAlreadyCompleted(true)
                    }
                }

                // Fetch global prompt
                const res = await fetch('/api/challenge')
                const data = await res.json()
                setPrompt(data.prompt)
            } catch {
                toast.error("Failed to load daily challenge")
            } finally {
                setIsLoadingPrompt(false)
            }
        }
        fetchDaily()
    }, [supabase])

    const handleStart = () => {
        setHasStarted(true)
        startRecording()
    }

    const handleStop = useCallback(async () => {
        stopRecording()
        setIsFinished(true)
        setIsGrading(true)

        try {
            const res = await fetch('/api/grade-speaking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript, expectedTopic: prompt })
            })

            if (!res.ok) throw new Error("Failed to grade")
            const data = await res.json()
            setResult(data)

            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Save session
                await supabase.from('sessions').insert({
                    user_id: user.id,
                    activity_type: 'daily_challenge',
                    score: data.overall,
                    duration: 120 - timeLeft,
                    transcript: transcript
                })

                // Add XP (+60 for Daily Challenge)
                const { data: profile, error: profileErr } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
                if (profileErr && profileErr.code === 'PGRST116') {
                    // Profile doesn't exist yet, create with initial XP
                    await supabase.from('profiles').upsert({
                        id: user.id,
                        xp: 60,
                        created_at: new Date().toISOString(),
                    })
                } else if (profile) {
                    await supabase.from('profiles').update({ xp: (profile.xp || 0) + 60 }).eq('id', user.id)
                }
            }

            if (data.overall >= 70) {
                confetti({ particleCount: 200, zIndex: 100, origin: { y: 0.6 } })
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to process your speaking response.")
        } finally {
            setIsGrading(false)
        }
    }, [stopRecording, transcript, prompt, supabase, timeLeft])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (hasStarted && !isFinished && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
        } else if (timeLeft === 0 && hasStarted && !isFinished) {
            handleStop()
        }
        return () => clearInterval(timer)
    }, [hasStarted, timeLeft, isFinished, handleStop])

    if (isLoadingPrompt) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        </div>
    )

    if (alreadyCompleted) return (
        <div className="min-h-screen bg-[#080810] text-white flex flex-col items-center justify-center p-4">
            <CheckCircle2 className="w-24 h-24 text-emerald-500 mb-6" />
            <h1 className="text-4xl font-bold mb-4">You&apos;ve crushed it today!</h1>
            <p className="text-zinc-400 max-w-md text-center mb-8">You have already completed the Daily Challenge. Come back tomorrow for a fresh prompt, or try the Timed Challenges.</p>
            <GradientButton onClick={() => router.push('/challenges')} className="px-8 py-3">
                Return to Arena
            </GradientButton>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#080810] text-white flex flex-col p-4 md:p-8">
            <header className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full">
                <button onClick={() => router.push('/challenges')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-sm font-bold uppercase tracking-wider">
                    <CalendarDays className="w-4 h-4" /> Daily Global Challenge
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
                                        className={`${timeLeft < 10 ? 'text-rose-500' : 'text-amber-500'}`}
                                        strokeDasharray={2 * Math.PI * 88}
                                        initial={{ strokeDashoffset: 0 }}
                                        animate={{ strokeDashoffset: ((120 - timeLeft) / 120) * (2 * Math.PI * 88) }}
                                        transition={{ duration: 1, ease: "linear" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center border-4 border-amber-500/10 rounded-full m-4">
                                    <span className={`text-5xl font-mono font-black ${timeLeft < 10 ? 'text-rose-400' : 'text-amber-400'}`}>
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-4xl font-bold mb-12 min-h-[100px] flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-white text-balance leading-relaxed">
                                &quot;{prompt}&quot;
                            </h2>

                            <div className="w-full h-40 bg-white/5 rounded-2xl p-6 mb-8 overflow-y-auto border border-white/10 relative text-left">
                                {!hasStarted && <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-lg">Press start to record your 2-minute answer...</div>}
                                <p className="text-zinc-300 relative z-10 text-lg">{transcript}</p>
                            </div>

                            {!hasStarted ? (
                                <GradientButton onClick={handleStart} className="px-12 py-4 shadow-[0_0_40px_rgba(245,158,11,0.4)] from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400">
                                    Begin Recording <Mic className="w-5 h-5 ml-2" />
                                </GradientButton>
                            ) : (
                                <button
                                    onClick={handleStop}
                                    className="px-12 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/50 rounded-xl font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse"
                                >
                                    Finish & Submit <Square className="w-5 h-5 fill-current" />
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
                            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-2">NOVA is evaluating</h2>
                            <p className="text-zinc-400 max-w-sm">Comparing your fluency against the global daily leaderboard standards...</p>
                        </motion.div>
                    ) : result ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full bg-gradient-to-br from-[#1a150f] to-[#0f0f1a] border border-amber-500/30 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none" />

                            <Trophy className={`w-20 h-20 mx-auto mb-6 ${result.overall >= 80 ? 'text-amber-400' : 'text-zinc-400'}`} />
                            <h2 className="text-5xl font-black mb-2">{result.overall}%</h2>
                            <p className="text-xs tracking-widest uppercase font-bold text-amber-500 mb-8">+ 60 XP Earned</p>

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
                                <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-2"><Sparkles className="w-4 h-4 text-amber-500" /> NOVA Feedback</h4>
                                <p className="text-zinc-300 text-sm leading-relaxed">{result.feedback}</p>
                            </div>

                            <GradientButton onClick={() => router.push('/challenges')} className="px-8 py-4 w-full from-amber-500 to-orange-500">
                                Return to Arena
                            </GradientButton>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </main>
        </div>
    )
}
// Add CheckCircle2 import fix above in UI component (already done inside layout file block dynamically handled via react icons but verifying)
