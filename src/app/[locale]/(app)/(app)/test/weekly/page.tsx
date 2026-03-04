"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, ArrowLeft, ArrowRight, CalendarDays, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { WEEKLY_TEST } from '@/data/tests'

export default function WeeklyTestPage() {
    const router = useRouter()
    const supabase = createClient()
    const { isSupported, startListening, stopListening } = useVoiceRecorder()

    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [saving, setSaving] = useState(false)

    // STT placeholder logic for Voice Recording
    const transcript = ''
    const isListening = false

    const handleMCQ = (qId: string, option: string) => {
        if (!submitted) setAnswers(prev => ({ ...prev, [qId]: option }))
    }

    const handleInput = (qId: string, val: string) => {
        if (!submitted) setAnswers(prev => ({ ...prev, [qId]: val }))
    }

    const handleSubmit = async () => {
        if (Object.keys(answers).length < WEEKLY_TEST.filter(q => q.type !== 'voice').length) {
            toast.error('Please answer all questions before submitting.')
            return
        }

        let correct = 0
        WEEKLY_TEST.forEach(q => {
            if (q.type === 'voice' || q.type === 'writing') { correct += 1; return } // AI graded independently in full scale, auto credit here for demo
            const userAns = (answers[q.id] || '').toLowerCase().trim()
            const correctAns = q.answer.toLowerCase().trim()
            if (userAns === correctAns) correct++
        })
        const pct = Math.round((correct / WEEKLY_TEST.length) * 100)
        setScore(pct)
        setSubmitted(true)

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('sessions').insert({
                    user_id: user.id,
                    type: 'test_weekly',
                    score: pct,
                    mistakes_count: WEEKLY_TEST.length - correct,
                    duration: 10
                })
            }
        } catch (e) {
            console.error('Error saving weekly test', e)
        }
        setSaving(false)
    }

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                <div className="mb-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <CalendarDays className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Weekly Knowledge Check</h1>
                    <p className="text-zinc-400">10 Questions • Review this week&apos;s topics and weak areas</p>
                </div>

                <div className="space-y-6">
                    {WEEKLY_TEST.map((q, idx) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                        >
                            <p className="font-medium text-zinc-200 mb-4 text-lg">
                                <span className="text-primary font-bold mr-3">{idx + 1}.</span>
                                <span className="text-xs uppercase px-2 py-1 bg-white/10 text-zinc-400 rounded-md mr-2">{q.type}</span>
                                {q.question}
                            </p>

                            {q.type === 'mcq' && q.options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map(opt => {
                                        const selected = answers[q.id] === opt
                                        const isCorrect = submitted && opt === q.answer
                                        const isWrong = submitted && selected && opt !== q.answer
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleMCQ(q.id, opt)}
                                                className={`p-4 rounded-xl text-sm text-left border transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' :
                                                    isWrong ? 'border-red-500 bg-red-500/10 text-red-300' :
                                                        selected ? 'border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' :
                                                            'border-white/10 text-zinc-400 hover:border-white/30 hover:bg-white/5'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {q.type === 'fill' && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={answers[q.id] || ''}
                                        onChange={e => handleInput(q.id, e.target.value)}
                                        placeholder="Type your answer..."
                                        disabled={submitted}
                                        className={`w-full bg-white/5 border rounded-xl px-5 py-4 text-white placeholder-zinc-600 outline-none focus:border-primary transition-colors text-lg ${submitted
                                            ? answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
                                                ? 'border-emerald-500'
                                                : 'border-red-500'
                                            : 'border-white/20'
                                            }`}
                                    />
                                    {submitted && (
                                        <p className="text-sm mt-3 text-zinc-400">Correct Answer: <span className="text-emerald-400 font-bold">{q.answer}</span></p>
                                    )}
                                </div>
                            )}

                            {q.type === 'writing' && (
                                <textarea
                                    value={answers[q.id] || ''}
                                    onChange={e => handleInput(q.id, e.target.value)}
                                    disabled={submitted}
                                    rows={4}
                                    placeholder="Draft your response here..."
                                    className={`w-full bg-white/5 border rounded-xl px-5 py-4 text-white placeholder-zinc-600 outline-none transition-colors text-sm resize-none ${submitted ? 'border-emerald-500/50 opacity-50' : 'border-white/20 focus:border-primary'}`}
                                />
                            )}

                            {q.type === 'voice' && (
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={isListening ? stopListening : startListening}
                                        disabled={!isSupported || submitted}
                                        className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 rounded-xl font-bold transition-all ${isListening
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
                                            } disabled:opacity-50`}
                                    >
                                        <Mic className="w-5 h-5" />
                                        {isListening ? 'Recording...' : 'Record Answer'}
                                    </button>
                                    {transcript && <p className="text-zinc-300 italic p-3 bg-white/5 rounded-xl border border-white/10">&quot;{transcript}&quot;</p>}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 mb-20">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.button
                                key="submit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full py-5 bg-white text-black font-extrabold text-lg rounded-2xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {saving ? 'Generating Report...' : 'Submit Weekly Test'} <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 bg-gradient-to-br from-primary/20 to-indigo-500/10 border border-primary/30 rounded-3xl"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                                        <Award className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Weekly Report Card</h3>
                                        <p className="text-zinc-300">Great consistency this week!</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-4xl font-black text-white">{score}%</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1">Knowledge</p>
                                        <p className="text-xl font-bold text-emerald-400">+12% vs last week</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1">Top Strength</p>
                                        <p className="text-xl font-bold text-primary">Vocabulary</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                                >
                                    Done
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
