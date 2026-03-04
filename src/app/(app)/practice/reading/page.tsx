"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mic } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'

const ARTICLE = {
    title: 'The Science of Habit Formation',
    level: 'B2',
    readTime: 4,
    paragraphs: [
        'Habits are the brain\'s way of automating repetitive tasks. When you perform an action repeatedly, the brain creates a neural pathway that makes the action easier over time. This process, called myelination, wraps the nerve fibers in a protective sheath that speeds up signal transmission.',
        'The habit loop has three stages: cue, routine, and reward. The cue triggers the habit, the routine is the behaviour itself, and the reward reinforces the loop. Understanding this loop is the first step to changing unwanted habits or building new ones.',
        'Research suggests it takes an average of 66 days to form a new habit — not the often-cited 21 days. The time varies depending on the complexity of the habit and individual differences. Simple habits like drinking a glass of water after waking take less time; complex ones like daily exercise may take longer.',
        'To build a good habit, start small. James Clear, author of Atomic Habits, recommends the "two-minute rule" — make new habits take less than two minutes to start. Run for two minutes, read one page, or meditate for one breath. The goal is to show up consistently, even imperfectly.',
    ],
    blanks: [
        { sentence: 'Habits are the brain\'s way of ___ repetitive tasks.', answer: 'automating' },
        { sentence: 'The habit loop has ___ stages: cue, routine, and reward.', answer: 'three' },
        { sentence: 'It takes an average of ___ days to form a new habit.', answer: '66' },
    ]
}

interface PopupState { word: string; x: number; y: number; loading: boolean; definition: string }

export default function ReadingPage() {
    const router = useRouter()
    const supabase = createClient()
    const { isSupported, startListening, stopListening } = useVoiceRecorder()
    const { isListening } = { isListening: false }
    const [popup, setPopup] = useState<PopupState | null>(null)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [blankAnswers, setBlankAnswers] = useState<Record<number, string>>({})
    const [blanksChecked, setBlanksChecked] = useState(false)
    const [sessionSaved, setSessionSaved] = useState(false)
    const articleRef = useRef<HTMLDivElement>(null)

    const handleScroll = useCallback(() => {
        const el = document.documentElement
        const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
        setScrollProgress(Math.min(100, progress))
    }, [])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    const handleWordClick = async (word: string, e: React.MouseEvent) => {
        const clean = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase()
        if (clean.length < 4) return
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        setPopup({ word: clean, x: rect.left, y: rect.bottom + window.scrollY + 8, loading: true, definition: '' })

        try {
            const res = await fetch('/api/nova', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userMessage: `Define the word "${clean}" in one simple sentence. Then give a short example.`,
                    conversationHistory: [],
                    topic: 'Vocabulary Definition',
                    userLevel: 'B2'
                })
            })
            const data = await res.json()
            setPopup(p => p ? { ...p, loading: false, definition: data.novaResponse } : null)
        } catch {
            setPopup(p => p ? { ...p, loading: false, definition: 'Definition not available.' } : null)
        }
    }

    const renderParagraph = (text: string, pIdx: number) =>
        text.split(' ').map((word, i) => (
            <button
                key={`${pIdx}-${i}`}
                onClick={(e) => handleWordClick(word, e)}
                className="hover:text-primary hover:underline decoration-dotted underline-offset-2 transition-colors cursor-pointer"
            >
                {word}{' '}
            </button>
        ))

    const checkBlanks = async () => {
        setBlanksChecked(true)
        let correct = 0
        ARTICLE.blanks.forEach((b, i) => {
            if (blankAnswers[i]?.toLowerCase().trim() === b.answer.toLowerCase()) correct++
        })
        const score = Math.round((correct / ARTICLE.blanks.length) * 100)
        toast[score >= 70 ? 'success' : 'error'](`Fill-in score: ${score}%`)

        if (!sessionSaved) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) await supabase.from('sessions').insert({ user_id: user.id, type: 'reading', score, duration: ARTICLE.readTime })
                setSessionSaved(true)
            } catch (e) { console.error(e) }
        }
    }

    return (
        <div className="min-h-screen bg-[#080810] text-white" onClick={() => setPopup(null)}>
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
                <motion.div className="h-full bg-primary" animate={{ width: `${scrollProgress}%` }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 py-12" ref={articleRef}>
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">{ARTICLE.level}</span>
                    <span className="text-xs text-zinc-500">{ARTICLE.readTime} min read</span>
                </div>
                <h1 className="text-2xl font-bold mb-8">{ARTICLE.title}</h1>

                <p className="text-xs text-zinc-500 mb-4">Click any word to see its definition</p>

                <div className="space-y-5 mb-10">
                    {ARTICLE.paragraphs.map((para, i) => (
                        <p key={i} className="text-zinc-300 leading-8 text-[15px]">
                            {renderParagraph(para, i)}
                        </p>
                    ))}
                </div>

                {/* Fill in the Blanks */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6">
                    <h3 className="font-semibold mb-4">Fill in the Blanks</h3>
                    <div className="space-y-4">
                        {ARTICLE.blanks.map((b, i) => {
                            const parts = b.sentence.split('___')
                            const isCorrect = blanksChecked && blankAnswers[i]?.toLowerCase().trim() === b.answer.toLowerCase()
                            const isWrong = blanksChecked && !isCorrect
                            return (
                                <div key={i} className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                                    <span>{parts[0]}</span>
                                    <input
                                        type="text"
                                        value={blankAnswers[i] || ''}
                                        onChange={e => !blanksChecked && setBlankAnswers(p => ({ ...p, [i]: e.target.value }))}
                                        className={`px-3 py-1 rounded-lg bg-white/10 border text-white outline-none w-28 text-center text-sm ${isCorrect ? 'border-emerald-500' : isWrong ? 'border-red-500' : 'border-white/20 focus:border-primary'
                                            }`}
                                    />
                                    <span>{parts[1]}</span>
                                    {isWrong && <span className="text-xs text-red-400">({b.answer})</span>}
                                    {isCorrect && <span className="text-xs text-emerald-400">✓</span>}
                                </div>
                            )
                        })}
                    </div>
                    <button onClick={checkBlanks} disabled={blanksChecked} className="mt-5 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all">
                        Check Answers
                    </button>
                </div>

                {/* Voice Summary */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                    <h3 className="font-semibold mb-1">Voice Summary Challenge</h3>
                    <p className="text-xs text-zinc-400 mb-4">Summarize what you just read in 30 seconds</p>
                    <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={!isSupported}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                            } disabled:opacity-50`}
                    >
                        <Mic className="w-4 h-4" />
                        {isListening ? 'Stop Recording' : 'Start Summary'}
                    </button>
                </div>
            </div>

            {/* Word Popup */}
            <AnimatePresence>
                {popup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{ top: popup.y, left: Math.min(popup.x, typeof window !== 'undefined' ? window.innerWidth - 280 : 800) }}
                        className="fixed z-50 w-64 bg-zinc-900 border border-white/20 rounded-xl p-4 shadow-2xl pointer-events-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="font-bold text-primary capitalize mb-2">{popup.word}</p>
                        {popup.loading ? (
                            <div className="flex gap-1.5"><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" /><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.15s]" /><span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.3s]" /></div>
                        ) : (
                            <p className="text-sm text-zinc-300 leading-relaxed">{popup.definition}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
