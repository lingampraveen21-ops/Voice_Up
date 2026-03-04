"use client"

import { useEffect, useState } from 'react'

import { ArrowLeft, Target, TrendingUp, Zap, Clock, ShieldCheck, History } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { BADGES, getLevelFromXP, LEVEL_THRESHOLDS } from '@/lib/gamification'

interface SkillData {
    subject: string
    A: number
    fullMark: number
}

// Dummy data for visual line chart showing XP growth
const historyData = [
    { name: 'Mon', xp: 400 },
    { name: 'Tue', xp: 550 },
    { name: 'Wed', xp: 620 },
    { name: 'Thu', xp: 800 },
    { name: 'Fri', xp: 1250 },
    { name: 'Sat', xp: 1400 },
    { name: 'Sun', xp: 1850 },
]

interface SessionData {
    id: string
    type: string
    created_at: string
    duration: number
    score: number
}

interface UserProfile {
    id: string
    xp: number
    earned_badges: string
    scores: string
}

export default function ProgressPage() {
    const router = useRouter()
    const supabase = createClient()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [stats, setStats] = useState<SkillData[]>([])
    const [earnedBadges, setEarnedBadges] = useState<string[]>([])
    const [recentSessions, setRecentSessions] = useState<SessionData[]>([])

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push('/login')

            const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (p) {
                setProfile(p)
                let badgesArr: string[] = []
                try { badgesArr = JSON.parse(p.earned_badges || '[]') } catch { }
                setEarnedBadges(badgesArr)
            }

            // Radar Chart derived from JSON stored scores
            let scores = null
            try { scores = JSON.parse(p?.scores || '{}') } catch { }

            const skillData: SkillData[] = [
                { subject: 'Speaking', A: scores?.speaking || 50, fullMark: 100 },
                { subject: 'Grammar', A: scores?.grammar || 65, fullMark: 100 },
                { subject: 'Listening', A: scores?.listening || 40, fullMark: 100 },
                { subject: 'Vocabulary', A: scores?.vocabulary || 70, fullMark: 100 },
                { subject: 'Writing', A: scores?.writing || 85, fullMark: 100 },
            ]
            setStats(skillData)

            // Fetch recent 5 sessions
            const { data: sessions } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5)

            if (sessions) setRecentSessions(sessions)
        }
        load()
    }, [router, supabase])

    if (!profile) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center text-white">
            <Zap className="w-8 h-8 text-primary animate-pulse" />
        </div>
    )

    const levelObj = LEVEL_THRESHOLDS.find(t => t.level === getLevelFromXP(profile.xp || 0)) || LEVEL_THRESHOLDS[0]
    const nextLevelObj = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(levelObj) + 1]
    const xpProgress = nextLevelObj ? ((profile.xp || 0) - levelObj.minXP) / (nextLevelObj.minXP - levelObj.minXP) * 100 : 100

    const readiness = Math.round(
        ((stats.find((s: SkillData) => s.subject === 'Speaking')?.A || 0) * 0.35) +
        ((stats.find((s: SkillData) => s.subject === 'Writing')?.A || 0) * 0.25) +
        ((stats.find((s: SkillData) => s.subject === 'Listening')?.A || 0) * 0.20) +
        ((stats.find((s: SkillData) => s.subject === 'Vocabulary')?.A || 0) * 0.20)
    )

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-primary" /> Learning Progress
                        </h1>
                        <p className="text-zinc-400 text-lg">Track your growth and unlocked achievements.</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Rank</p>
                            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">{levelObj.level}</h2>
                            <p className="text-sm font-bold text-primary">{profile.xp || 0} XP</p>
                        </div>
                        {nextLevelObj && (
                            <div className="w-48 hidden sm:block">
                                <div className="flex justify-between text-xs text-zinc-500 mb-2 font-bold">
                                    <span>{levelObj.level}</span>
                                    <span>{nextLevelObj.level}</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${xpProgress}%` }} />
                                </div>
                                <p className="text-right text-[10px] text-zinc-500 mt-1">{nextLevelObj.minXP - (profile.xp || 0)} XP to Next Level</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Radar Chart */}
                    <div className="lg:col-span-1 bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" /> Skill Mastery
                        </h3>
                        <div className="h-64 sm:h-80 w-full relative">
                            {/* Readiness Overlay */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none">
                                <p className="text-3xl font-black text-primary drop-shadow-md">{readiness}%</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Ready</p>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Score" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* XP Line Chart */}
                    <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> XP Growth History
                        </h3>
                        <div className="h-64 sm:h-80 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    <Line type="monotone" dataKey="xp" stroke="#eab308" strokeWidth={3} dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Badges Collection */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Badges Collection
                            </h3>
                            <p className="text-sm font-bold text-zinc-500">{earnedBadges.length} / {BADGES.length}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {BADGES.map(b => {
                                const isEarned = earnedBadges.includes(b.id)
                                return (
                                    <div
                                        key={b.id}
                                        className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isEarned ? 'bg-gradient-to-br from-white/10 to-transparent border-white/20' : 'bg-black/30 border-white/5 opacity-50 grayscale'}`}
                                    >
                                        <div className="text-3xl mb-2">{b.icon}</div>
                                        <p className="text-sm font-bold text-white mb-1">{b.title}</p>
                                        <p className="text-[10px] text-zinc-400">{b.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-400" /> Recent Activity
                        </h3>
                        {recentSessions.length === 0 ? (
                            <div className="h-40 flex items-center justify-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                                No activity recorded yet. Time to start learning!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentSessions.map((session: SessionData) => (
                                    <div key={session.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold capitalize text-zinc-200">{session.type.replace('_', ' ')}</p>
                                                <p className="text-xs text-zinc-500">{new Date(session.created_at).toLocaleDateString()} • {session.duration} mins</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-emerald-400">{session.score}%</p>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Score</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="w-full py-4 mt-6 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-zinc-400 rounded-xl transition-colors">
                            View Full History
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
