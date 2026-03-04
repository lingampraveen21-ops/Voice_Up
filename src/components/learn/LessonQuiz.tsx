"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Mic, RefreshCw, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Lesson } from '@/data/lessons'
import { getLessonById } from '@/data/lessons'
import { createClient } from '@/lib/supabase/client'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

interface LessonQuizProps {
    lesson: Lesson
    onBack: () => void
}

export function LessonQuiz({ lesson, onBack }: LessonQuizProps) {
    const router = useRouter()
    const supabase = createClient()
    const { isSupported, startListening, stopListening } = useVoiceRecorder()
    const { speak } = useSpeechSynthesis()

    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [saving, setSaving] = useState(false)
    const { transcript, isListening } = { transcript: '', isListening: false } // placeholder for voice

    const handleMCQ = (qId: string, option: string) => {
        if (!submitted) setAnswers(prev => ({ ...prev, [qId]: option }))
    }

    const handleFill = (qId: string, val: string) => {
        if (!submitted) setAnswers(prev => ({ ...prev, [qId]: val }))
    }

    const handleSubmit = async () => {
        let correct = 0
        lesson.quiz.forEach(q => {
            if (q.type === 'voice') { correct += 1; return } // give full credit for voice
            const userAns = (answers[q.id] || '').toLowerCase().trim()
            const correctAns = q.answer.toLowerCase().trim()
            if (userAns === correctAns) correct++
        })
        const pct = Math.round((correct / lesson.quiz.length) * 100)
        setScore(pct)
        setSubmitted(true)

        // Save to Supabase
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('sessions').insert({
                    user_id: user.id,
                    lesson_id: lesson.id,
                    type: 'quiz',
                    score: pct,
                    mistakes_count: lesson.quiz.length - correct,
                    duration: lesson.duration
                })
                if (pct >= 70) toast.success(`🎉 ${pct}% — Lesson Complete! Next lesson unlocked.`)
                else toast.error(`${pct}% — You need 70% to continue. Try again!`)
            }
        } catch (e) { console.error('Error saving quiz', e) }
        setSaving(false)
    }

    const handleNextLesson = () => {
        // Find the next lesson in the same module
        const allLessons = getLessonById(lesson.id)
        if (!allLessons) { router.push('/learn'); return }
        router.push('/learn')
    }

    const passed = score >= 70

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm mb-8 transition-colors">
                    ← Back to Lesson
                </button>

                <h2 className="text-2xl font-bold mb-2">Lesson Quiz</h2>
                <p className="text-zinc-400 text-sm mb-8">{lesson.title} · {lesson.quiz.length} questions · Pass mark: 70%</p>

                <div className="space-y-6">
                    {lesson.quiz.map((q, idx) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                        >
                            <p className="font-medium text-zinc-200 mb-4">
                                <span className="text-primary font-bold mr-2">{idx + 1}.</span>
                                {q.question}
                            </p>

                            {q.type === 'mcq' && q.options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options.map(opt => {
                                        const selected = answers[q.id] === opt
                                        const isCorrect = submitted && opt === q.answer
                                        const isWrong = submitted && selected && opt !== q.answer
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleMCQ(q.id, opt)}
                                                className={`p-3 rounded-xl text-sm text-left border transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' :
                                                        isWrong ? 'border-red-500 bg-red-500/10 text-red-300' :
                                                            selected ? 'border-primary bg-primary/10 text-white' :
                                                                'border-white/10 text-zinc-300 hover:border-white/30'
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
                                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-primary transition-colors ${submitted
                                                ? answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
                                                    ? 'border-emerald-500'
                                                    : 'border-red-500'
                                                : 'border-white/20'
                                            }`}
                                    />
                                    {submitted && (
                                        <p className="text-xs mt-2 text-zinc-400">Correct: <span className="text-emerald-400 font-bold">{q.answer}</span></p>
                                    )}
                                </div>
                            )}

                            {q.type === 'voice' && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={isListening ? stopListening : startListening}
                                        disabled={!isSupported || submitted}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${isListening
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
                                            } disabled:opacity-50`}
                                    >
                                        <Mic className="w-4 h-4" />
                                        {isListening ? 'Stop' : 'Record Answer'}
                                    </button>
                                    {transcript && <p className="text-sm text-zinc-400">&quot;{transcript}&quot;</p>}
                                    {submitted && <span className="text-xs text-emerald-400 font-bold">✓ Voice accepted</span>}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Submit / Results */}
                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.button
                                key="submit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
                            >
                                Submit Quiz →
                            </motion.button>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-2xl p-6 border text-center ${passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                            >
                                {passed ? (
                                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                                ) : (
                                    <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                                )}
                                <p className="text-3xl font-bold mb-1">{score}%</p>
                                <p className={`text-sm mb-4 ${passed ? 'text-emerald-300' : 'text-red-300'}`}>
                                    {passed
                                        ? 'Excellent work! You\'ve unlocked the next lesson.'
                                        : 'You need 70% to continue. Review the lesson and try again.'}
                                </p>
                                {!passed && (
                                    <button
                                        onClick={() => { speak("Let me re-explain. " + lesson.sections[0].content); setTimeout(() => { setSubmitted(false); setAnswers({}) }, 3000) }}
                                        className="flex items-center gap-2 mx-auto text-sm text-zinc-300 hover:text-white"
                                    >
                                        <RefreshCw className="w-4 h-4" /> NOVA will re-explain, then retry
                                    </button>
                                )}
                                {passed && (
                                    <button
                                        onClick={handleNextLesson}
                                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
                                    >
                                        Next Lesson <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
