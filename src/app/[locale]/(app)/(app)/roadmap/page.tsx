"use client"

"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Edit3, CheckCircle2, Lock, Loader2, Sparkles, Map, Clock, BookOpen, Mic2, Headphones, PenTool } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface RoadmapStep {
    dayLabel: string
    title: string
    description: string
    status: 'completed' | 'current' | 'locked'
    skill?: string
}

interface RoadmapResponse {
    roadmap: RoadmapStep[]
    advice: string
}

interface UserProfile {
    id: string
    cefr_level: string
    goal: string
    target_minutes: number
    interview_date: string
    generated_roadmap: string
}

const GOALS = [
    { value: 'Job Interview', label: 'Job Interview', emoji: '💼' },
    { value: 'Academic', label: 'Academic', emoji: '🎓' },
    { value: 'Everyday', label: 'Everyday', emoji: '💬' },
    { value: 'Advanced', label: 'Advanced', emoji: '🚀' },
]

const TIMELINES = [
    { days: 10, label: '10 Days', emoji: '🔥' },
    { days: 30, label: '30 Days', emoji: '⚡' },
    { days: 60, label: '60 Days', emoji: '📚' },
    { days: 90, label: '90 Days', emoji: '🌱' },
]

const DAILY_TIMES = [
    { minutes: 10, label: '10 min' },
    { minutes: 20, label: '20 min' },
    { minutes: 30, label: '30 min' },
    { minutes: 60, label: '1 hour' },
]

const skillIcon = (skill?: string) => {
    switch (skill?.toLowerCase()) {
        case 'speaking': return <Mic2 className="w-4 h-4" />
        case 'listening': return <Headphones className="w-4 h-4" />
        case 'writing': return <PenTool className="w-4 h-4" />
        case 'reading': return <BookOpen className="w-4 h-4" />
        default: return <BookOpen className="w-4 h-4" />
    }
}

export default function RoadmapPage() {
    const router = useRouter()
    const supabase = createClient()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    // Form state
    const [goal, setGoal] = useState('Job Interview')
    const [timeline, setTimeline] = useState(30)
    const [dailyMinutes, setDailyMinutes] = useState(20)

    const generateRoadmap = useCallback(async (userProfile: UserProfile, formGoal: string, formTimeline: number, formDailyMinutes: number) => {
        setGenerating(true)
        try {
            const res = await fetch('/api/roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: userProfile.cefr_level || 'A1',
                    goal: formGoal,
                    dailyCommitment: formDailyMinutes,
                    interviewDate: userProfile.interview_date || 'No specific date',
                    timeline: formTimeline,
                })
            })
            if (!res.ok) throw new Error("Failed to generate")
            const data: RoadmapResponse = await res.json()
            setRoadmapData(data)

            await supabase.from('profiles').update({
                generated_roadmap: JSON.stringify(data),
                goal: formGoal,
            }).eq('id', userProfile.id)

            if (data.roadmap.length > 0) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to generate your personalized roadmap.")
        } finally {
            setGenerating(false)
        }
    }, [supabase])

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push('/login')

            const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (p) {
                setProfile(p)
                if (p.goal) setGoal(p.goal)
                if (p.generated_roadmap) {
                    try {
                        setRoadmapData(JSON.parse(p.generated_roadmap))
                    } catch { /* show empty state */ }
                }
            }
            setLoading(false)
        }
        load()
    }, [router, supabase])

    if (loading) return (
        <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center text-white">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
        </div>
    )

    // CASE 1 — No roadmap yet: show form
    if (!roadmapData) {
        return (
            <div className="min-h-screen bg-[#080810] text-white">
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </button>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                            <Map className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black mb-3">Your Personal Roadmap</h1>
                        <p className="text-zinc-400 text-lg max-w-md mx-auto">Generate a day-by-day learning plan based on your goal and timeline</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
                        {/* Goal Selector */}
                        <div>
                            <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3 block">What&apos;s your goal?</label>
                            <div className="grid grid-cols-2 gap-3">
                                {GOALS.map(g => (
                                    <button
                                        key={g.value}
                                        onClick={() => setGoal(g.value)}
                                        className={`p-4 rounded-2xl border text-left transition-all ${goal === g.value
                                            ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                                            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'}`}
                                    >
                                        <span className="text-2xl mb-2 block">{g.emoji}</span>
                                        <span className="font-bold text-sm">{g.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Selector */}
                        <div>
                            <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Timeline</label>
                            <div className="grid grid-cols-4 gap-3">
                                {TIMELINES.map(t => (
                                    <button
                                        key={t.days}
                                        onClick={() => setTimeline(t.days)}
                                        className={`p-4 rounded-2xl border text-center transition-all ${timeline === t.days
                                            ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                                            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'}`}
                                    >
                                        <span className="text-xl block mb-1">{t.emoji}</span>
                                        <span className="font-bold text-xs">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Daily Time Selector */}
                        <div>
                            <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Daily practice time
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {DAILY_TIMES.map(d => (
                                    <button
                                        key={d.minutes}
                                        onClick={() => setDailyMinutes(d.minutes)}
                                        className={`py-3 px-4 rounded-xl border font-bold text-sm text-center transition-all ${dailyMinutes === d.minutes
                                            ? 'bg-primary/10 border-primary/50 text-white'
                                            : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05]'}`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <motion.button
                            onClick={() => profile && generateRoadmap(profile, goal, timeline, dailyMinutes)}
                            disabled={generating || !profile}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    NOVA is creating your plan...
                                </>
                            ) : (
                                <>
                                    🗺️ Generate My Roadmap
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        )
    }

    // CASE 2 — Has roadmap: show timeline
    const completedCount = roadmapData.roadmap.filter(s => s.status === 'completed').length
    const totalCount = roadmapData.roadmap.length
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Map className="w-8 h-8 text-indigo-400" /> My Learning Roadmap
                        </h1>
                        <p className="text-zinc-400 text-lg">{roadmapData.advice || "Your journey exactly as planned."}</p>
                    </div>
                    <button
                        onClick={() => setRoadmapData(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-zinc-300 transition-colors shrink-0"
                    >
                        <Edit3 className="w-4 h-4" /> Regenerate Roadmap
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-12 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-zinc-400">Overall Progress</span>
                        <span className="text-sm font-bold text-primary">{completedCount}/{totalCount} milestones</span>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                        />
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative pl-4 md:pl-8 mb-20">
                    <div className="absolute top-0 bottom-0 left-[26px] md:left-[42px] w-0.5 bg-gradient-to-b from-primary via-indigo-500/50 to-transparent" />

                    <div className="space-y-10 relative z-10">
                        <AnimatePresence>
                            {roadmapData.roadmap.map((step: RoadmapStep, idx: number) => {
                                const isCurrent = step.status === 'current'
                                const isCompleted = step.status === 'completed'

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="relative flex items-start gap-6 md:gap-10 group"
                                    >
                                        {/* Timeline Node */}
                                        <div className="mt-1 relative flex-shrink-0">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 relative 
                                                ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                                                    isCurrent ? 'bg-primary shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse' :
                                                        'bg-[#080810] border-2 border-white/20'}`}
                                            >
                                                {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#080810]" />}
                                                {isCurrent && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                                                {!isCompleted && !isCurrent && <Lock className="w-3 h-3 text-white/20" />}
                                            </div>
                                        </div>

                                        {/* Content Card */}
                                        <div className={`flex-1 p-6 md:p-8 rounded-3xl border transition-all duration-300
                                            ${isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' :
                                                isCurrent ? 'bg-primary/10 border-primary/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] -translate-y-1' :
                                                    'bg-white/[0.02] border-white/5 opacity-40'}`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit
                                                        ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' :
                                                            isCurrent ? 'bg-primary/20 text-primary' :
                                                                'bg-white/10 text-zinc-500'}`}
                                                    >
                                                        {step.dayLabel}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary text-white">
                                                            TODAY
                                                        </span>
                                                    )}
                                                </div>
                                                {step.skill && (
                                                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                        {skillIcon(step.skill)} {step.skill}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`text-2xl font-bold mb-3 ${isCompleted ? 'text-zinc-200' : isCurrent ? 'text-white' : 'text-zinc-500'}`}>
                                                {step.title}
                                            </h3>
                                            <p className={`${isCurrent ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                                {step.description}
                                            </p>

                                            {isCurrent && (
                                                <button onClick={() => router.push('/learn')} className="mt-6 px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-colors">
                                                    Continue Module
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                <p className="text-center text-xs text-zinc-600">Powered by NOVA AI Model</p>
            </div>
        </div>
    )
}
