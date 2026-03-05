"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LEVEL_UP_TEST } from '@/data/tests'
import confetti from 'canvas-confetti'

export default function LevelUpTestPage() {
    const router = useRouter()
    const supabase = createClient()

    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [saving, setSaving] = useState(false)

    const handleMCQ = (qId: string, option: string) => {
        if (!submitted) setAnswers(prev => ({ ...prev, [qId]: option }))
    }

    const handleInput = (qId: string, val: string) => {
        if (!submitted) setAnswers(prev => ({ ...prev, [qId]: val }))
    }

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: NodeJS.Timeout = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    const handleSubmit = async () => {
        let correct = 0
        LEVEL_UP_TEST.forEach(q => {
            if (q.type === 'voice' || q.type === 'writing') { correct += 1; return }
            const userAns = (answers[q.id] || '').toLowerCase().trim()
            const correctAns = q.answer.toLowerCase().trim()
            if (userAns === correctAns) correct++
        })
        const pct = Math.round((correct / LEVEL_UP_TEST.length) * 100)
        setScore(pct)
        setSubmitted(true)

        if (pct >= 85) triggerConfetti()

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && pct >= 85) {
                // If passed level up test (>= 85%), bump CEFR level. Hard-coded logic for demo.
                await supabase.from('profiles').update({ cefr_level: 'B1' }).eq('id', user.id)
                await supabase.from('sessions').insert({
                    user_id: user.id,
                    type: 'test_levelup',
                    score: pct,
                    duration_seconds: 30
                })
            }
        } catch (e) {
            console.error('Error saving level up test', e)
        }
        setSaving(false)
    }

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Exit
                </button>

                <div className="mb-10 text-center">
                    <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">CEFR Level Up Test</h1>
                    <p className="text-zinc-400 text-lg">Comprehensive Exam • Passing Score: 85%</p>
                </div>

                <div className="space-y-8">
                    {LEVEL_UP_TEST.map((q, idx) => (
                        <div key={q.id} className="bg-white/[0.04] border border-white/10 rounded-3xl p-8">
                            <p className="font-medium text-zinc-200 mb-6 text-xl">
                                <span className="text-amber-500 font-bold mr-3">{idx + 1}.</span>
                                {q.question}
                            </p>

                            {q.type === 'mcq' && q.options && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map(opt => {
                                        const selected = answers[q.id] === opt
                                        const isCorrect = submitted && opt === q.answer
                                        const isWrong = submitted && selected && opt !== q.answer
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleMCQ(q.id, opt)}
                                                className={`p-5 rounded-2xl text-left border transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' :
                                                    isWrong ? 'border-red-500 bg-red-500/10 text-red-300' :
                                                        selected ? 'border-amber-500 bg-amber-500/10 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                                                            'border-white/10 text-zinc-300 hover:border-white/30 hover:bg-white/5'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {q.type === 'fill' && (
                                <input
                                    type="text"
                                    value={answers[q.id] || ''}
                                    onChange={e => handleInput(q.id, e.target.value)}
                                    placeholder="Type your answer..."
                                    disabled={submitted}
                                    className={`w-full bg-white/5 border rounded-2xl px-6 py-5 text-white placeholder-zinc-600 outline-none focus:border-amber-500 transition-colors text-lg ${submitted
                                        ? answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
                                            ? 'border-emerald-500 text-emerald-300'
                                            : 'border-red-500 text-red-300'
                                        : 'border-white/20'
                                        }`}
                                />
                            )}
                            {(q.type === 'voice' || q.type === 'writing') && (
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center text-sm text-zinc-400">
                                    <i>Response recorded via external modal in full implementation. (Auto-credited for this demo tier)</i>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 mb-20">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.button
                                key="submit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full py-6 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-xl rounded-full hover:opacity-90 transition-opacity shadow-[0_0_40px_rgba(245,158,11,0.4)] disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {saving ? 'Verifying Results...' : 'Submit Level Up Test'} <ArrowRight className="w-6 h-6" />
                            </motion.button>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-3xl p-12 text-center border relative overflow-hidden ${score >= 85 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                            >
                                <p className="text-8xl font-black mb-4">{score}%</p>
                                {score >= 85 ? (
                                    <>
                                        <h3 className="text-3xl font-bold text-amber-500 mb-4">Level Up Unlocked! 🎉</h3>
                                        <p className="text-zinc-300 text-lg mb-8">Congratulations! You have demonstrated mastery of your current level. Your CEFR level has been upgraded.</p>
                                        <button onClick={() => router.push('/dashboard')} className="px-10 py-5 bg-amber-500 text-black font-bold text-lg rounded-full hover:bg-amber-400 transition-colors shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                            Return to Dashboard
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-3xl font-bold text-red-400 mb-4">Not quite ready yet</h3>
                                        <p className="text-zinc-300 text-lg mb-8">You need 85% to level up. Review your mistakes and keep practicing in the learning modules.</p>
                                        <button onClick={() => router.push('/dashboard')} className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-full transition-colors">
                                            Return to Dashboard
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
