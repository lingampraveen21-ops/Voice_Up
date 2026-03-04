"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { useFeedbackStore } from '@/store/useFeedbackStore'

interface Passage {
    id: string
    title: string
    text: string
    questions: { q: string, options: string[], answer: string }[]
    dictation: string
}

const PASSAGES: Passage[] = [
    {
        id: 'p1',
        title: 'The Rise of Remote Work',
        text: 'Remote work has transformed the way we think about offices. In 2020, millions of workers shifted to working from home overnight. Studies show that many employees are more productive at home, with fewer interruptions. However, some workers miss the social aspect of office life. Companies are now experimenting with hybrid models, where employees split their time between home and the office.',
        questions: [
            { q: 'When did remote work rapidly increase?', options: ['2015', '2018', '2020', '2022'], answer: '2020' },
            { q: 'What do some studies show about home workers?', options: ['They are less focused', 'They are more productive', 'They work fewer hours', 'They earn more'], answer: 'They are more productive' },
            { q: 'What are hybrid models?', options: ['Online-only companies', 'Split time between home and office', 'Teams in different countries', 'Freelance arrangements'], answer: 'Split time between home and office' },
        ],
        dictation: 'Remote work has transformed the way we think about offices.'
    },
    {
        id: 'p2',
        title: 'Climate and Daily Life',
        text: 'Climate change is affecting everyday decisions. People are choosing electric vehicles, reducing meat consumption, and installing solar panels. Governments are setting ambitious targets to reach net zero by 2050. While individual actions matter, experts say systemic changes in industry and energy production are essential for meaningful progress.',
        questions: [
            { q: 'What target are many governments setting?', options: ['Zero plastic by 2030', 'Net zero by 2050', 'No fossil fuels by 2040', 'Clean air by 2060'], answer: 'Net zero by 2050' },
            { q: 'What are individuals doing to reduce their impact?', options: ['Buying more products', 'Choosing electric vehicles', 'Moving to cities', 'Working longer hours'], answer: 'Choosing electric vehicles' },
            { q: 'According to experts, what is essential for real progress?', options: ['Individual action only', 'Government speeches', 'Systemic industrial changes', 'More research'], answer: 'Systemic industrial changes' },
        ],
        dictation: 'Climate change is affecting everyday decisions.'
    }
]

const SPEEDS = [0.75, 1, 1.25, 1.5]

export default function ListeningPage() {
    const router = useRouter()
    const supabase = createClient()
    const t = useTranslations("Practice.listening")
    const openFeedback = useFeedbackStore(state => state.openFeedback)

    const [passage] = useState<Passage>(PASSAGES[Math.floor(Math.random() * PASSAGES.length)])
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState(1)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [dictationInput, setDictationInput] = useState('')
    const [dictationChecked, setDictationChecked] = useState(false)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const bars = [0.2, 0.5, 0.8, 0.4, 0.9, 0.3, 0.6, 0.2]

    const playAudio = () => {
        if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return }
        const utt = new SpeechSynthesisUtterance(passage.text)
        utt.rate = speed
        utt.pitch = 1.05
        utt.onend = () => setIsPlaying(false)
        utteranceRef.current = utt
        window.speechSynthesis.speak(utt)
        setIsPlaying(true)
    }

    const handleSpeedChange = (s: number) => {
        setSpeed(s)
        if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false) }
    }

    const checkDictation = () => {
        setDictationChecked(true)
        const match = dictationInput.toLowerCase().trim() === passage.dictation.toLowerCase().trim()
        if (match) toast.success(t("correctDictation"))
        else toast.error(t("wrongDictation"))
    }

    const handleSubmit = async () => {
        let correct = 0
        passage.questions.forEach(q => { if (answers[q.q] === q.answer) correct++ })
        const score = Math.round((correct / passage.questions.length) * 100)
        setSubmitted(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data, error } = await supabase.from('sessions').insert({
                    user_id: user.id,
                    skill: 'listening',
                    score,
                    duration_seconds: 15,
                    xp_earned: 25
                }).select('id').single()

                if (!error && data) {
                    setTimeout(() => openFeedback(data.id), 2000)
                }
            }
        } catch (e) { console.error(e) }
        toast.success(t("score", { score }))
    }

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> {t("returnBtn")}
                </button>

                <h1 className="text-2xl font-bold mb-1">🎧 {t("title")}</h1>
                <p className="text-zinc-400 text-sm mb-8">{t("desc")}</p>

                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6">
                    <p className="font-semibold text-white mb-1">{passage.title}</p>
                    <p className="text-xs text-zinc-500 mb-5">{t("followAlong")}</p>

                    <div className="flex items-center gap-1 h-14 mb-5 justify-center">
                        {bars.map((h, i) => (
                            <motion.div
                                key={i}
                                className="w-1.5 bg-primary rounded-full"
                                animate={isPlaying ? { scaleY: [h, h * 2.5, h], opacity: [0.6, 1, 0.6] } : { scaleY: h }}
                                transition={isPlaying ? { duration: 0.6 + i * 0.05, repeat: Infinity, repeatType: 'reverse' } : {}}
                                style={{ height: '100%', transformOrigin: 'center' }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={playAudio}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isPlaying ? 'bg-red-500 text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
                        >
                            {isPlaying ? <><Pause className="w-4 h-4" /> {t("stop")}</> : <><Play className="w-4 h-4" /> {t("play")}</>}
                        </button>
                        <div className="flex items-center gap-1">
                            {SPEEDS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleSpeedChange(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${speed === s ? 'bg-primary text-white' : 'bg-white/10 text-zinc-400 hover:bg-white/20'}`}
                                >
                                    {s}×
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-4">{t("comprehension")}</h3>
                    <div className="space-y-4">
                        {passage.questions.map((q) => (
                            <div key={q.q} className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                                <p className="text-sm text-zinc-200 mb-3">{q.q}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map(opt => {
                                        const sel = answers[q.q] === opt
                                        const correct = submitted && opt === q.answer
                                        const wrong = submitted && sel && opt !== q.answer
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => !submitted && setAnswers(p => ({ ...p, [q.q]: opt }))}
                                                className={`p-2.5 rounded-lg text-xs text-left border transition-all ${correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' :
                                                    wrong ? 'border-red-500 bg-red-500/10 text-red-300' :
                                                        sel ? 'border-primary bg-primary/10 text-white' :
                                                            'border-white/10 text-zinc-400 hover:border-white/30'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 mb-6">
                    <h3 className="font-semibold mb-1">{t("dictationTitle")}</h3>
                    <p className="text-xs text-zinc-400 mb-3">{t("dictationDesc")}</p>
                    <button onClick={() => { const u = new SpeechSynthesisUtterance(passage.dictation); u.rate = speed; window.speechSynthesis.speak(u) }} className="text-xs text-primary mb-3 hover:underline">
                        🔊 {t("playSentence")}
                    </button>
                    <input
                        type="text"
                        value={dictationInput}
                        onChange={e => setDictationInput(e.target.value)}
                        placeholder={t("typePlace")}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-primary mb-3"
                    />
                    {dictationChecked && (
                        <div className={`text-xs mb-2 ${dictationInput.toLowerCase().trim() === passage.dictation.toLowerCase().trim() ? 'text-emerald-400' : 'text-red-400'}`}>
                            {dictationInput.toLowerCase().trim() === passage.dictation.toLowerCase().trim() ? t("dictationFeedbackCorrect") : t("dictationFeedbackWrong", { sentence: passage.dictation })}
                        </div>
                    )}
                    <button onClick={checkDictation} className="text-sm text-primary font-bold hover:underline">{t("checkAnswer")}</button>
                </div>

                {!submitted ? (
                    <button onClick={handleSubmit} className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all">
                        {t("submit")}
                    </button>
                ) : (
                    <div className="flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">{t("sessionSaved")}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
