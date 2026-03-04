"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, CheckCircle2, XCircle, Timer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GradientButton } from '@/components/ui/GradientButton'
import confetti from 'canvas-confetti'

// Hardcoded pool of grammar questions for the Blitz
const BLITZ_QUESTIONS = [
    { q: "She _____ to the gym every morning.", o: ["go", "goes", "going", "gone"], a: 1 },
    { q: "If I _____ rich, I would travel the world.", o: ["am", "was", "were", "been"], a: 2 },
    { q: "By this time next year, I _____ my degree.", o: ["will finish", "will have finished", "finished", "finishing"], a: 1 },
    { q: "He _____ his keys; he can't find them anywhere.", o: ["has lost", "lost", "loses", "losing"], a: 0 },
    { q: "I'm looking forward _____ you.", o: ["to see", "seeing", "to seeing", "see"], a: 2 },
    { q: "The movie was _____ boring that I fell asleep.", o: ["so", "such", "very", "too"], a: 0 },
    { q: "You had better _____ a doctor.", o: ["to see", "see", "seeing", "saw"], a: 1 },
    { q: "Neither of the answers _____ correct.", o: ["are", "is", "be", "were"], a: 1 },
    { q: "I _____ living in a big city.", o: ["am used to", "used to", "use to", "used"], a: 0 },
    { q: "Hardly _____ entered the room when the phone rang.", o: ["I had", "did I", "had I", "I have"], a: 2 },
    { q: "He asked me where _____.", o: ["did I live", "do I live", "I lived", "I live"], a: 2 },
    { q: "Despite _____ sick, she came to work.", o: ["she was", "of being", "being", "been"], a: 2 },
    { q: "I wish I _____ more time.", o: ["have", "had", "would have", "having"], a: 1 },
    { q: "The more you study, _____ you will learn.", o: ["the more", "more", "most", "the most"], a: 0 },
    { q: "It's time we _____ home.", o: ["go", "went", "going", "gone"], a: 1 },
]

export default function GrammarBlitzPage() {
    const router = useRouter()

    const [questions, setQuestions] = useState<typeof BLITZ_QUESTIONS>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [hasStarted, setHasStarted] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [timeLeft, setTimeLeft] = useState(30)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isChecking, setIsChecking] = useState(false)

    useEffect(() => {
        // Randomly pick 10 questions on load
        const shuffled = [...BLITZ_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 10)
        setQuestions(shuffled)
    }, [])

    const finishGame = useCallback(() => {
        setIsFinished(true)
        if (score > 200) {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } })
        }
        // In a real app we would save the score to Supabase here
    }, [score])

    const handleAnswer = (index: number) => {
        if (isChecking) return
        setSelectedOption(index)
        setIsChecking(true)

        const isCorrect = index === questions[currentIndex].a
        if (isCorrect) {
            // Add time bonus! (up to 30 points)
            setScore(prev => prev + 10 + timeLeft)
        }

        setTimeout(() => advanceQuestion(isCorrect), 1500)
    }

    const advanceQuestion = useCallback((_wasCorrect: boolean) => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setTimeLeft(30)
            setSelectedOption(null)
            setIsChecking(false)
        } else {
            finishGame()
        }
    }, [currentIndex, questions.length, finishGame])

    const handleTimeout = useCallback(() => {
        setIsChecking(true)
        setSelectedOption(-1) // marks wrong
        setTimeout(() => advanceQuestion(false), 1500)
    }, [advanceQuestion])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (hasStarted && !isFinished && !isChecking && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
        } else if (timeLeft === 0 && hasStarted && !isFinished && !isChecking) {
            handleTimeout()
        }
        return () => clearInterval(timer)
    }, [hasStarted, isFinished, isChecking, timeLeft, handleTimeout])

    return (
        <div className="min-h-screen bg-[#080810] text-white flex flex-col p-4 md:p-8">
            <header className="flex items-center justify-between mb-8 max-w-2xl mx-auto w-full">
                <button onClick={() => router.push('/challenges')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center flex flex-col items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Brain className="w-5 h-5 text-fuchsia-400" /> Grammar Blitz
                    </h1>
                    {hasStarted && !isFinished && (
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-fuchsia-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(currentIndex / 10) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-mono text-zinc-500">{currentIndex + 1}/10</span>
                        </div>
                    )}
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl font-bold text-fuchsia-400 font-mono">
                    {score} <span className="text-zinc-500 text-xs uppercase tracking-widest hidden sm:inline">PTS</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto w-full relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none" />

                <AnimatePresence mode="wait">
                    {!hasStarted ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center w-full"
                        >
                            <div className="w-24 h-24 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mx-auto mb-8 relative">
                                <Brain className="w-10 h-10 text-fuchsia-400" />
                                <div className="absolute inset-0 border-2 border-fuchsia-500/30 rounded-full animate-ping" />
                            </div>
                            <h2 className="text-4xl font-black mb-4">Are you ready?</h2>
                            <p className="text-zinc-400 mb-10 max-w-sm mx-auto">10 fast-paced questions. 30 seconds each. Quick answers give score multipliers. One mistake drops your combo.</p>
                            <GradientButton onClick={() => setHasStarted(true)} className="px-12 py-4 from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_0_40px_rgba(217,70,239,0.3)]">
                                Start Blitz
                            </GradientButton>
                        </motion.div>
                    ) : isFinished ? (
                        <motion.div
                            key="finish"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center w-full bg-white/5 border border-fuchsia-500/20 rounded-3xl p-8 backdrop-blur-md"
                        >
                            <h2 className="text-3xl font-bold mb-2">Blitz Complete!</h2>
                            <p className="text-zinc-400 mb-8">Your final score</p>

                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400 mb-10 drop-shadow-[0_0_30px_rgba(217,70,239,0.5)]">
                                {score}
                            </div>

                            <GradientButton onClick={() => router.push('/challenges')} className="w-full py-4 from-fuchsia-600 to-purple-600">
                                Return to Arena
                            </GradientButton>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`q-${currentIndex}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            <div className="flex justify-between items-end mb-8">
                                <h3 className="text-2xl md:text-3xl font-bold leading-relaxed pr-8">
                                    {questions[currentIndex].q}
                                </h3>
                                <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-zinc-400'}`}>
                                    <Timer className="w-5 h-5" /> {timeLeft}s
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {questions[currentIndex].o.map((opt, i) => {
                                    let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300"
                                    let icon = null

                                    if (isChecking) {
                                        if (i === questions[currentIndex].a) {
                                            btnClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                            icon = <CheckCircle2 className="w-5 h-5" />
                                        } else if (i === selectedOption) {
                                            btnClass = "bg-rose-500/20 border-rose-500/50 text-rose-400"
                                            icon = <XCircle className="w-5 h-5" />
                                        } else {
                                            btnClass = "bg-white/5 border-white/10 opacity-50 text-zinc-500"
                                        }
                                    }

                                    return (
                                        <button
                                            key={i}
                                            disabled={isChecking}
                                            onClick={() => handleAnswer(i)}
                                            className={`p-6 rounded-2xl border text-left font-bold text-lg transition-all flex items-center justify-between group ${btnClass}`}
                                        >
                                            {opt}
                                            {icon}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
