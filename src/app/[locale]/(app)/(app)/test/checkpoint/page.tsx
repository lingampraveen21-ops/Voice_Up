"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Mic, ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { CHECKPOINT_TEST } from '@/data/tests'

export default function CheckpointTestPage() {
    const router = useRouter()
    const supabase = createClient()
    const { isSupported, isRecording: isListening, transcript, startRecording: startListening, stopRecording: stopListening } = useVoiceRecorder()

    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [saving, setSaving] = useState(false)

    const handleMCQ = (qId: string, option: string) => {
        if (!submitted) setAnswers(prev => ({ ...prev, [qId]: option }))
    }

    const handleFill = (qId: string, val: string) => {
        if (!submitted) setAnswers(prev => ({ ...prev, [qId]: val }))
    }

    const handleSubmit = async () => {
        if (Object.keys(answers).length < CHECKPOINT_TEST.filter(q => q.type !== 'voice').length) {
            toast.error('Please answer all text-based questions first.')
            return
        }

        let correct = 0
        CHECKPOINT_TEST.forEach(q => {
            if (q.type === 'voice') { correct += 1; return } // automatic full credit for voice in basic test
            const userAns = (answers[q.id] || '').toLowerCase().trim()
            const correctAns = q.answer.toLowerCase().trim()
            if (userAns === correctAns) correct++
        })
        const pct = Math.round((correct / CHECKPOINT_TEST.length) * 100)
        setScore(pct)
        setSubmitted(true)

        // Save to Supabase
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('sessions').insert({
                    user_id: user.id,
                    type: 'test_checkpoint',
                    score: pct,
                    mistakes_count: CHECKPOINT_TEST.length - correct,
                    duration_seconds: 15
                })
            }
        } catch (e) {
            console.error('Error saving checkpoint test', e)
        }
        setSaving(false)
    }

    const masteryLevel = score >= 80 ? 'Mastered' : score >= 60 ? 'Needs Attention' : 'Not Ready'

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Exit Test
                </button>

                <div className="mb-10 text-center">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">Evaluation</span>
                    <h1 className="text-3xl font-bold mb-2">Checkpoint Test</h1>
                    <p className="text-zinc-400">15 Questions • Assess your recent learning progress</p>
                </div>

                <div className="space-y-6">
                    {CHECKPOINT_TEST.map((q, idx) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                        >
                            <p className="font-medium text-zinc-200 mb-4 text-lg">
                                <span className="text-primary font-bold mr-3">{idx + 1}.</span>
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
                                        onChange={e => handleFill(q.id, e.target.value)}
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
                                        {isListening ? 'Recording... Tap to Stop' : 'Record Answer'}
                                    </button>
                                    {transcript && <p className="text-zinc-300 italic p-3 bg-white/5 rounded-xl border border-white/10">&quot;{transcript}&quot;</p>}
                                    {submitted && <span className="text-sm text-emerald-400 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Voice response accepted</span>}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.button
                                key="submit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full py-5 bg-gradient-to-r from-primary to-emerald-400 text-black font-extrabold text-lg rounded-2xl hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {saving ? 'Evaluating...' : 'Submit Evaluation'} <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                                {score >= 80 ? (
                                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6 relative z-10" />
                                ) : (
                                    <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-6 relative z-10" />
                                )}

                                <p className="text-6xl font-black mb-2 relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">{score}%</p>
                                <p className="text-xl font-bold text-primary mb-6 relative z-10">{masteryLevel}</p>

                                <p className="text-zinc-300 mb-8 max-w-md mx-auto relative z-10">
                                    {score >= 80
                                        ? "Outstanding! You've mastered the recent materials. You are ready to move on to the next set of modules."
                                        : "Good effort. Reviewing the mistakes above will help solidify your understanding before moving on."}
                                </p>

                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all relative z-10"
                                >
                                    Return to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
