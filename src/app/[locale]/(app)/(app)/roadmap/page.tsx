"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit3, Target, CalendarDays, CheckCircle2, Lock, Loader2, Sparkles, Map } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface RoadmapStep {
    dayLabel: string
    title: string
    description: string
    status: 'completed' | 'current' | 'locked'
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

export default function RoadmapPage() {
    const router = useRouter()
    const supabase = createClient()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    const fetchRoadmap = async (userProfile: UserProfile) => {
        setGenerating(true)
        try {
            const res = await fetch('/api/roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: userProfile.cefr_level || 'A1',
                    goal: userProfile.goal || 'General Improvement',
                    dailyCommitment: userProfile.target_minutes || 15,
                    interviewDate: userProfile.interview_date || 'No specific date'
                })
            })
            if (!res.ok) throw new Error("Failed to generate")
            const data: RoadmapResponse = await res.json()
            setRoadmapData(data)

            // Save to profile
            await supabase.from('profiles').update({
                generated_roadmap: JSON.stringify(data)
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
    }

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push('/login')

            const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (p) {
                setProfile(p)
                if (p.generated_roadmap) {
                    try {
                        setRoadmapData(JSON.parse(p.generated_roadmap))
                        setLoading(false)
                    } catch {
                        await fetchRoadmap(p)
                        setLoading(false)
                    }
                } else {
                    await fetchRoadmap(p)
                    setLoading(false)
                }
            }
        }
        load()
    }, [router, supabase])

    if (loading || generating) return (
        <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center text-white">
            <Sparkles className="w-16 h-16 text-primary animate-pulse mb-6" />
            <h2 className="text-3xl font-bold mb-2">Analyzing your goal</h2>
            <p className="text-zinc-400">NOVA is generating your personalized 7-step roadmap...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6 pb-6 border-b border-white/10">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Map className="w-8 h-8 text-indigo-400" /> My Learning Roadmap
                        </h1>
                        <p className="text-zinc-400 text-lg">{roadmapData?.advice || "Your journey exactly as planned."}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                            <Target className="w-5 h-5 text-emerald-400" />
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Goal</p>
                                <p className="text-sm font-bold truncate max-w-[150px]">{profile?.goal || 'General'}</p>
                            </div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                            <CalendarDays className="w-5 h-5 text-amber-500" />
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Target</p>
                                <p className="text-sm font-bold truncate max-w-[120px]">
                                    {profile?.interview_date ? new Date(profile.interview_date).toLocaleDateString() : 'No Target'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative pl-4 md:pl-8 mb-20">
                    {/* Vertical Beam */}
                    <div className="absolute top-0 bottom-0 left-[26px] md:left-[42px] w-0.5 bg-gradient-to-b from-primary via-indigo-500/50 to-transparent" />

                    <div className="space-y-12 relative z-10">
                        {roadmapData?.roadmap?.map((step: RoadmapStep, idx: number) => {
                            const isCurrent = step.status === 'current'
                            const isCompleted = step.status === 'completed'

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
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
                                                'bg-white/[0.02] border-white/5 opacity-60'}`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit
                                                ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' :
                                                    isCurrent ? 'bg-primary/20 text-primary' :
                                                        'bg-white/10 text-zinc-500'}`}
                                            >
                                                {step.dayLabel}
                                            </span>
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
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => fetchRoadmap(profile!)}
                        disabled={generating || !profile}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold flex items-center justify-center gap-2 rounded-xl mx-auto transition-colors disabled:opacity-50"
                    >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit3 className="w-5 h-5" />}
                        {generating ? 'Regenerating Roadmap...' : 'Regenerate Timeline (Goals Changed)'}
                    </button>
                    <p className="text-xs text-zinc-600 mt-4">Powered by NOVA AI Model</p>
                </div>
            </div>
        </div>
    )
}
