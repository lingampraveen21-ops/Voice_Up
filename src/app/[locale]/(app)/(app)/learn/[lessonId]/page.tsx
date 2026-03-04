"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpen, Mic } from 'lucide-react'
import { getLessonById } from '@/data/lessons'
import { LessonQuiz } from '@/components/learn/LessonQuiz'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

interface TooltipState {
    word: string
    definition: string
    example: string
    x: number
    y: number
}

export default function LessonPage() {
    const params = useParams()
    const router = useRouter()
    const { speak } = useSpeechSynthesis()
    const lesson = getLessonById(params.lessonId as string)
    const [sectionIndex, setSectionIndex] = useState(0)
    const [showQuiz, setShowQuiz] = useState(false)
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    useEffect(() => {
        if (!lesson) router.push('/learn')
    }, [lesson, router])

    if (!lesson) return null

    const section = lesson.sections[sectionIndex]
    const isLast = sectionIndex === lesson.sections.length - 1

    const handleNext = () => {
        if (isLast) setShowQuiz(true)
        else setSectionIndex(p => p + 1)
    }

    const handleVocabClick = (word: string, e: React.MouseEvent) => {
        const vocab = lesson.vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase())
        if (!vocab) return
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        setTooltip({ word: vocab.word, definition: vocab.definition, example: vocab.example, x: rect.left, y: rect.bottom + window.scrollY + 8 })
        speak(`${vocab.word}. ${vocab.definition}. For example: ${vocab.example}`)
    }

    const VocabWord = ({ word }: { word: string }) => {
        const hasVocab = lesson.vocabulary.some(v => v.word.toLowerCase() === word.toLowerCase())
        if (!hasVocab) return <span>{word} </span>
        return (
            <button
                onClick={(e) => handleVocabClick(word, e)}
                className="text-primary underline decoration-dotted underline-offset-2 hover:text-primary/80 cursor-pointer"
            >
                {word}{' '}
            </button>
        )
    }

    const renderContent = (content: string) =>
        content.split(' ').map((word, i) => <VocabWord key={i} word={word.replace(/[.,!?"]/g, '')} />)

    const skillIcon = { speaking: '🎙️', listening: '🎧', reading: '📖', writing: '✍️' }

    if (showQuiz) return <LessonQuiz lesson={lesson} onBack={() => setShowQuiz(false)} />

    return (
        <div className="min-h-screen bg-[#080810] text-white" onClick={() => setTooltip(null)}>
            <div className="max-w-2xl mx-auto px-4 py-10">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <button onClick={() => router.push('/learn')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Learn
                    </button>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span>{skillIcon[lesson.skill]}</span>
                                <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">{lesson.level}</span>
                                <span className="text-xs text-zinc-500">{lesson.duration} min</span>
                            </div>
                            <h1 className="text-2xl font-bold">{lesson.title}</h1>
                        </div>
                    </div>
                    {/* Section Progress */}
                    <div className="flex gap-1.5 mt-5">
                        {lesson.sections.map((_, i) => (
                            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= sectionIndex ? 'bg-primary' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </motion.div>

                {/* Section Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={sectionIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="mb-8"
                    >
                        {section.type === 'text' && (
                            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Lesson</span>
                                </div>
                                <p className="text-zinc-200 leading-relaxed text-[15px]">{renderContent(section.content)}</p>
                            </div>
                        )}

                        {section.type === 'example' && (
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Example</p>
                                <p className="text-zinc-300 leading-relaxed italic text-[15px]">{section.content}</p>
                                <button
                                    onClick={() => speak(section.content)}
                                    className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Mic className="w-4 h-4" /> Try saying this
                                </button>
                            </div>
                        )}

                        {section.type === 'vocab' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {lesson.vocabulary.map(v => (
                                    <button
                                        key={v.word}
                                        onClick={() => speak(`${v.word}. ${v.definition}. Example: ${v.example}`)}
                                        className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-all"
                                    >
                                        <p className="font-bold text-white mb-1">{v.word}</p>
                                        <p className="text-xs text-zinc-400 leading-relaxed">{v.definition}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Nav Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSectionIndex(p => p - 1)}
                        disabled={sectionIndex === 0}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-xs text-zinc-600">{sectionIndex + 1} / {lesson.sections.length}</span>
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                        {isLast ? 'Take Quiz' : 'Next'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Vocab Tooltip */}
            <AnimatePresence>
                {tooltip && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ top: tooltip.y, left: Math.min(tooltip.x, window.innerWidth - 280) }}
                        className="fixed z-50 w-64 bg-zinc-900 border border-white/20 rounded-xl p-4 shadow-2xl pointer-events-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="font-bold text-primary mb-1">{tooltip.word}</p>
                        <p className="text-sm text-zinc-300 mb-2">{tooltip.definition}</p>
                        <p className="text-xs text-zinc-500 italic">&quot;{tooltip.example}&quot;</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
