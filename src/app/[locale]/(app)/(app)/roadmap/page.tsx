"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Sparkles, Map, Loader2, Mic, MicOff,
    ChevronRight, Trash2, CheckCircle2, Lock,
    Mic2, Headphones, PenTool, BookOpen, Clock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoadmapStep {
    dayLabel: string
    title: string
    description: string
    status: 'completed' | 'current' | 'locked'
    skill?: string
}

interface RoadmapData {
    roadmap: RoadmapStep[]
    advice: string
}

interface SavedRoadmap {
    id: string
    goal_text: string
    roadmap_json: RoadmapData
    advice: string
    created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const skillIcon = (skill?: string) => {
    switch (skill?.toLowerCase()) {
        case 'speaking': return <Mic2 className="w-3.5 h-3.5" />
        case 'listening': return <Headphones className="w-3.5 h-3.5" />
        case 'writing': return <PenTool className="w-3.5 h-3.5" />
        case 'reading': return <BookOpen className="w-3.5 h-3.5" />
        default: return <BookOpen className="w-3.5 h-3.5" />
    }
}

// ─── Roadmap Timeline ─────────────────────────────────────────────────────────
function RoadmapTimeline({ data, onReset }: { data: RoadmapData, onReset: () => void }) {
    const router = useRouter()
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            {/* Advice + Regenerate */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 bg-[#6c63ff]/10 border border-[#6c63ff]/20 rounded-2xl">
                <p className="text-zinc-300 text-sm leading-relaxed flex-1">
                    <span className="text-[#6c63ff] font-bold">NOVA: </span>
                    {data.advice}
                </p>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors shrink-0"
                >
                    New Goal
                </button>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 md:pl-10">
                <div className="absolute top-3 bottom-3 left-[11px] md:left-[19px] w-0.5 bg-gradient-to-b from-[#6c63ff] via-[#6c63ff]/30 to-transparent" />
                <div className="space-y-6">
                    {data.roadmap.map((step, idx) => {
                        const isCurrent = step.status === 'current'
                        const isCompleted = step.status === 'completed'
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                className="relative flex items-start gap-5 md:gap-8 group"
                            >
                                {/* Node */}
                                <div className="mt-1 flex-shrink-0 relative z-10">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center
                                        ${isCompleted ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' :
                                            isCurrent ? 'bg-[#6c63ff] shadow-[0_0_16px_rgba(108,99,255,0.5)] animate-pulse' :
                                                'bg-[#080810] border-2 border-white/15'}`}
                                    >
                                        {isCompleted && <CheckCircle2 className="w-3 h-3 text-black" />}
                                        {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        {!isCompleted && !isCurrent && <Lock className="w-2.5 h-2.5 text-white/20" />}
                                    </div>
                                </div>

                                {/* Card */}
                                <div className={`flex-1 p-5 md:p-6 rounded-2xl border transition-all
                                    ${isCompleted ? 'bg-emerald-500/5 border-emerald-500/15' :
                                        isCurrent ? 'bg-[#6c63ff]/10 border-[#6c63ff]/40 shadow-[0_0_24px_rgba(108,99,255,0.12)]' :
                                            'bg-white/[0.06] border-white/10 opacity-75'}`}
                                >
                                    <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full
                                                ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' :
                                                    isCurrent ? 'bg-[#6c63ff]/20 text-[#6c63ff]' :
                                                        'bg-white/8 text-zinc-500'}`}
                                            >
                                                {step.dayLabel}
                                            </span>
                                            {isCurrent && (
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#6c63ff] text-white">
                                                    Start Here
                                                </span>
                                            )}
                                        </div>
                                        {step.skill && (
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                                {skillIcon(step.skill)} {step.skill}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`text-lg font-bold mb-1.5 ${isCompleted ? 'text-zinc-200' : isCurrent ? 'text-white' : 'text-zinc-400'}`}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${isCurrent ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                        {step.description}
                                    </p>
                                    {isCurrent && (
                                        <button
                                            onClick={() => router.push('/learn')}
                                            className="mt-4 flex items-center gap-1.5 text-sm font-bold text-[#6c63ff] hover:text-[#9fa8ff] transition-colors"
                                        >
                                            Start practicing <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
            <p className="text-center text-[11px] text-zinc-700 mt-10">Generated by NOVA AI · VoiceUp</p>
        </motion.div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
    const router = useRouter()
    const supabase = createClient()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [userId, setUserId] = useState<string | null>(null)
    const [cefrLevel, setCefrLevel] = useState<string>('A1')
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    const [goalText, setGoalText] = useState('')
    const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null)
    const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([])

    // Mic / speech recognition
    const [isListening, setIsListening] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)

    // ── Load user + previous roadmaps ─────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push('/login')
            setUserId(user.id)

            const { data: p } = await supabase
                .from('profiles')
                .select('cefr_level')
                .eq('id', user.id)
                .single()

            if (p?.cefr_level) setCefrLevel(p.cefr_level)

            // Load roadmap history
            const { data: history } = await supabase
                .from('roadmaps')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (history) setSavedRoadmaps(history)
            setLoading(false)
        }
        load()
    }, [router, supabase])

    // ── Auto-resize textarea ───────────────────────────────────────────────────
    useEffect(() => {
        const ta = textareaRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
    }, [goalText])

    // ── Generate ──────────────────────────────────────────────────────────────
    const handleGenerate = useCallback(async () => {
        if (!goalText.trim() || !userId) return
        setGenerating(true)
        setActiveRoadmap(null)
        try {
            const res = await fetch('/api/roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userGoal: goalText.trim(), level: cefrLevel })
            })
            if (!res.ok) throw new Error('Failed to generate roadmap')
            const data: RoadmapData = await res.json()

            if (!data.roadmap?.length) throw new Error('Empty roadmap returned')

            setActiveRoadmap(data)

            // Save to Supabase roadmaps table
            const { data: saved } = await supabase.from('roadmaps').insert({
                user_id: userId,
                goal_text: goalText.trim(),
                roadmap_json: data,
                advice: data.advice,
            }).select('*').single()

            if (saved) {
                setSavedRoadmaps(prev => [saved, ...prev])
            }

            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
        } catch (err) {
            console.error(err)
            toast.error('NOVA couldn\'t generate your roadmap. Please try again.')
        } finally {
            setGenerating(false)
        }
    }, [goalText, userId, cefrLevel, supabase])

    // ── Mic ───────────────────────────────────────────────────────────────────
    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognitionAPI: any =
            w.SpeechRecognition || w.webkitSpeechRecognition

        if (!SpeechRecognitionAPI) {
            toast.error('Your browser doesn\'t support voice input. Please type your goal.')
            return
        }

        const recognition = new SpeechRecognitionAPI()
        recognition.lang = 'en-US'
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (e: any) => {
            const spoken = e.results[0][0].transcript
            setGoalText(prev => prev ? prev + ' ' + spoken : spoken)
        }
        recognition.onerror = () => {
            toast.error('Voice input failed. Please try again.')
            setIsListening(false)
        }
        recognition.onend = () => setIsListening(false)

        recognition.start()
        recognitionRef.current = recognition
        setIsListening(true)
    }

    // ── Delete saved roadmap ──────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        await supabase.from('roadmaps').delete().eq('id', id)
        setSavedRoadmaps(prev => prev.filter(r => r.id !== id))
        if (activeRoadmap) setActiveRoadmap(null)
        toast.success('Roadmap deleted.')
    }

    // Submit on Cmd/Ctrl+Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            handleGenerate()
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#080810] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#6c63ff] animate-pulse" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-3xl mx-auto px-4 py-12">

                {/* Back */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white mb-10 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-11 h-11 rounded-xl bg-[#6c63ff]/15 border border-[#6c63ff]/20 flex items-center justify-center">
                        <Map className="w-5 h-5 text-[#6c63ff]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Learning Roadmap</h1>
                        <p className="text-zinc-500 text-sm">Tell NOVA your goal — get a personalized day-by-day plan</p>
                    </div>
                </div>

                {/* ── Input Box ──────────────────────────────────────────────── */}
                <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)] focus-within:border-[#6c63ff]/40 transition-colors">
                    <textarea
                        ref={textareaRef}
                        value={goalText}
                        onChange={e => setGoalText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={generating}
                        placeholder={"Tell NOVA your goal...\ne.g. I have a TCS interview in 15 days, I can practice 20 minutes daily"}
                        rows={3}
                        className="w-full bg-transparent px-5 pt-5 pb-3 text-white placeholder-zinc-600 text-[15px] leading-relaxed resize-none outline-none disabled:opacity-50"
                        style={{ minHeight: '80px' }}
                    />

                    {/* Bottom bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                        {/* Mic button */}
                        <button
                            onClick={toggleMic}
                            title="Speak your goal"
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isListening
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }`}
                        >
                            {isListening ? (
                                <><MicOff className="w-4 h-4" /> Stop</>
                            ) : (
                                <><Mic className="w-4 h-4" /> Speak</>
                            )}
                        </button>

                        <div className="flex items-center gap-3">
                            <span className="text-[11px] text-zinc-700 hidden sm:block">⌘+Enter to generate</span>
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !goalText.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6c63ff] to-[#8b5cf6] hover:opacity-90 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(108,99,255,0.3)]"
                            >
                                {generating ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Generate Roadmap</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Generating animation ───────────────────────────────────── */}
                <AnimatePresence>
                    {generating && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 mt-5 px-1"
                        >
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-[#6c63ff]"
                                        style={{ animation: `bounce 1s infinite ${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                            <p className="text-zinc-500 text-sm">NOVA is crafting your personalized roadmap...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Active Roadmap ─────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {activeRoadmap && (
                        <RoadmapTimeline
                            key="active"
                            data={activeRoadmap}
                            onReset={() => { setActiveRoadmap(null); setGoalText('') }}
                        />
                    )}
                </AnimatePresence>

                {/* ── Previous Roadmaps ──────────────────────────────────────── */}
                {!activeRoadmap && savedRoadmaps.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-12"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Previous Roadmaps</h2>
                        </div>

                        <div className="space-y-3">
                            {savedRoadmaps.map((rm) => (
                                <motion.div
                                    key={rm.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group flex items-start gap-4 p-4 bg-white/[0.025] border border-white/8 hover:border-white/15 hover:bg-white/[0.04] rounded-2xl transition-all cursor-pointer"
                                    onClick={() => setActiveRoadmap(rm.roadmap_json)}
                                >
                                    <div className="w-9 h-9 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/15 flex items-center justify-center shrink-0 mt-0.5">
                                        <Map className="w-4 h-4 text-[#6c63ff]" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-zinc-200 font-medium line-clamp-2 leading-relaxed">
                                            {rm.goal_text}
                                        </p>
                                        <p className="text-xs text-zinc-600 mt-1">
                                            {new Date(rm.created_at).toLocaleDateString('en-US', {
                                                weekday: 'short', month: 'short', day: 'numeric'
                                            })}
                                            &nbsp;·&nbsp;
                                            {(rm.roadmap_json?.roadmap?.length || 0)} milestones
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-zinc-600 group-hover:text-[#6c63ff] flex items-center gap-1 transition-colors">
                                            View <ChevronRight className="w-3.5 h-3.5" />
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(rm.id) }}
                                            className="p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete this roadmap"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Empty state */}
                {!activeRoadmap && savedRoadmaps.length === 0 && !generating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-16 text-center"
                    >
                        <div className="text-5xl mb-4">🗺️</div>
                        <p className="text-zinc-500 text-sm">No roadmaps yet. Describe your goal above and let NOVA build your plan.</p>
                    </motion.div>
                )}

            </div>

            <style jsx>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    )
}
