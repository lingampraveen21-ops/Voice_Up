"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { useFeedbackStore } from '@/store/useFeedbackStore'

const PROMPTS = [
    { id: 'p1', type: 'Email', task: 'Write a professional email to your manager requesting a work-from-home day on Friday. Explain your reasons and propose how you will stay productive.' },
    { id: 'p2', type: 'Opinion', task: 'Write a short paragraph (100-150 words) expressing your opinion on whether social media has a positive or negative impact on communication skills.' },
    { id: 'p3', type: 'Description', task: 'Describe your ideal workplace. Include details about the physical environment, the team culture, and what makes it motivating to work there.' },
]

interface GradeResult {
    scores: { grammar: number; formality: number; structure: number; tone: number }
    mistakes: { original: string; corrected: string; explanation: string }[]
    suggestions: string[]
    overallFeedback: string
}

export default function WritingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [promptIdx, setPromptIdx] = useState(0)
    const [text, setText] = useState('')
    const [wordCount, setWordCount] = useState(0)
    const [grading, setGrading] = useState(false)
    const [result, setResult] = useState<GradeResult | null>(null)
    const [sessionSaved, setSessionSaved] = useState(false)
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)
    const [inlineHint, setInlineHint] = useState<string | null>(null)
    const prompt = PROMPTS[promptIdx]
    const openFeedback = useFeedbackStore(state => state.openFeedback)

    const t = useTranslations("Practice.writing")

    useEffect(() => {
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
        // Debounced inline grammar check
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        if (text.trim().length > 30) {
            debounceTimer.current = setTimeout(async () => {
                try {
                    const res = await fetch('/api/grade-writing', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userText: text, taskType: prompt.type, userLevel: 'B1' })
                    })
                    const data = await res.json()
                    if (data.mistakes?.length > 0) {
                        setInlineHint(`💡 Possible issue: "${data.mistakes[0].original}" → "${data.mistakes[0].corrected}"`)
                    } else {
                        setInlineHint(null)
                    }
                } catch { /* silent debounce fail */ }
            }, 3000)
        } else {
            setInlineHint(null)
        }
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
    }, [text, prompt.type])

    const handleSubmit = useCallback(async () => {
        if (wordCount < 20) { toast.error('Write at least 20 words to submit.'); return }
        setGrading(true)
        try {
            const res = await fetch('/api/grade-writing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userText: text, taskType: prompt.type, userLevel: 'B1' })
            })
            const data: GradeResult = await res.json()
            setResult(data)
            const avg = Math.round(Object.values(data.scores).reduce((a, b) => a + b, 0) / 4)
            if (!sessionSaved) {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data, error } = await supabase.from('sessions').insert({
                        user_id: user.id,
                        activity_type: 'writing',
                        score: avg,
                        duration_seconds: 600,
                        xp_earned: 35
                    }).select('id').single()

                    if (!error && data) {
                        setTimeout(() => openFeedback(data.id), 2000)
                    }
                    setSessionSaved(true)
                }
            }
        } catch { toast.error('Grading failed. Please try again.') }
        setGrading(false)
    }, [text, wordCount, prompt.type, sessionSaved, supabase, openFeedback])

    const scoreColor = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500'

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> {t("returnBtn")}
                </button>

                <h1 className="text-2xl font-bold mb-1">✍️ {t("title")}</h1>
                <p className="text-zinc-400 text-sm mb-6">{t("desc")}</p>

                {/* Prompt Selector */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {PROMPTS.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => { setPromptIdx(i); setText(''); setResult(null); setInlineHint(null) }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${promptIdx === i ? 'bg-primary text-white border-primary' : 'border-white/20 text-zinc-400 hover:border-white/40'}`}
                        >
                            {p.type}
                        </button>
                    ))}
                </div>

                {/* Prompt Card */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-5">
                    <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Your Task</p>
                    <p className="text-zinc-200 text-sm leading-relaxed">{prompt.task}</p>
                </div>

                {/* Inline Grammar Hint */}
                <AnimatePresence>
                    {inlineHint && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-3 text-xs text-amber-300"
                        >
                            {inlineHint}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Writing Area */}
                <div className="relative mb-2">
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder={t("placeholder")}
                        rows={8}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-primary/60 rounded-2xl p-5 text-zinc-200 placeholder-zinc-600 outline-none resize-none text-[15px] leading-relaxed transition-colors"
                    />
                    <div className={`absolute bottom-4 right-4 text-xs font-mono ${wordCount > 200 ? 'text-primary' : 'text-zinc-600'}`}>
                        {t("wordCount", { count: wordCount })}
                    </div>
                </div>

                {!result ? (
                    <button
                        onClick={handleSubmit}
                        disabled={grading || wordCount < 20}
                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition-all min-h-[44px] shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2"
                    >
                        {grading ? <><span className="animate-spin">⟳</span> {t("grading")}</> : t("submit")}
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                        {/* Score Bars */}
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                            <h3 className="font-semibold mb-5">{t("feedback")}</h3>
                            <div className="space-y-4">
                                {Object.entries(result.scores).map(([key, val]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="capitalize text-zinc-300">{key}</span>
                                            <span className="font-bold text-white">{val}/100</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${scoreColor(val)}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${val}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-zinc-400 mt-5 italic">{result.overallFeedback}</p>
                        </div>

                        {/* Mistakes */}
                        {result.mistakes.length > 0 && (
                            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                                <h3 className="font-semibold mb-4">{t("grammarScore")}</h3>
                                <div className="space-y-3">
                                    {result.mistakes.map((m, i) => (
                                        <div key={i} className="bg-white/5 rounded-xl p-4">
                                            <p className="text-red-400 line-through text-sm mb-1">&quot;{m.original}&quot;</p>
                                            <p className="text-emerald-400 font-medium text-sm mb-1">&quot;{m.corrected}&quot;</p>
                                            <p className="text-xs text-zinc-500">{m.explanation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {result.suggestions.length > 0 && (
                            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                                <h3 className="font-semibold mb-4">{t("vocabScore")}</h3>
                                <ul className="space-y-2">
                                    {result.suggestions.map((s, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-zinc-300"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => { setText(''); setResult(null); setInlineHint(null); setSessionSaved(false) }}
                            className="w-full py-3 border border-white/20 text-zinc-300 rounded-2xl hover:border-white/40 text-sm transition-all"
                        >
                            {t("good")} / {t("retry")}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
