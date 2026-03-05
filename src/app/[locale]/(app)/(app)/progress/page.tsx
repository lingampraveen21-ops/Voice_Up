"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Target, TrendingUp, Zap, Clock, ShieldCheck, History, BookOpen, Flame, Mic, Headphones, PenLine, BookMarked, Trophy, Timer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RiveNovaAvatar } from '@/components/ui/RiveNovaAvatar'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { BADGES, getLevelFromXP, LEVEL_THRESHOLDS } from '@/lib/gamification'

interface SkillData {
    subject: string
    A: number
    fullMark: number
}

interface SessionData {
    id: string
    activity_type: string
    created_at: string
    duration: number
    score: number
}

interface UserProfile {
    id: string
    xp: number
    streak: number
    earned_badges: string
    scores: string
}

// Skill config for the horizontal bar section
const SKILL_CONFIG = [
    { key: 'speaking', label: 'Speaking', icon: Mic, color: '#a855f7' },
    { key: 'listening', label: 'Listening', icon: Headphones, color: '#6366f1' },
    { key: 'writing', label: 'Writing', icon: PenLine, color: '#ec4899' },
    { key: 'vocabulary', label: 'Vocabulary', icon: BookMarked, color: '#f59e0b' },
    { key: 'grammar', label: 'Grammar', icon: BookOpen, color: '#10b981' },
]

// ─── Full-page empty state ─────────────────────────────────────────────────
function EmptyProgressState({ onStart }: { onStart: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        >
            {/* Illustration */}
            <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6c63ff]/20 to-[#ff6584]/20 border border-[#6c63ff]/20 flex items-center justify-center shadow-[0_0_60px_rgba(108,99,255,0.15)]">
                    <span className="text-6xl select-none">🚀</span>
                </div>
                {/* Orbiting sparkles */}
                <span className="absolute -top-1 -right-1 text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                <span className="absolute -bottom-2 -left-2 text-xl animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</span>
                <span className="absolute top-1/2 -right-6 text-lg animate-bounce" style={{ animationDelay: '0.7s' }}>💫</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                Your journey starts here! 🚀
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
                Complete your first lesson to see your progress tracked here.<br />
                Every word you learn brings you closer to fluency.
            </p>

            <button
                onClick={onStart}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:opacity-90 text-white font-bold text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(108,99,255,0.4)] hover:shadow-[0_0_40px_rgba(108,99,255,0.6)] hover:-translate-y-0.5"
            >
                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Learning
            </button>

            {/* Zero-state mini stats */}
            <div className="grid grid-cols-3 gap-6 mt-14 w-full max-w-sm">
                {[
                    { label: 'XP Earned', value: '0', emoji: '⚡' },
                    { label: 'Day Streak', value: '0', emoji: '🔥' },
                    { label: 'Sessions', value: '0', emoji: '📚' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col items-center">
                        <span className="text-2xl mb-1 grayscale opacity-50">{stat.emoji}</span>
                        <p className="text-xl font-black text-zinc-500">{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

// ─── Skill Bar component ────────────────────────────────────────────────────
function SkillBar({ label, icon: Icon, color, value }: { label: string, icon: React.ElementType, color: string, value: number }) {
    const isEmpty = value === 0
    return (
        <div className="flex items-center gap-4">
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18`, color }}
            >
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-zinc-300">{label}</span>
                    <span className={`text-xs font-bold ${isEmpty ? 'text-zinc-600' : ''}`} style={isEmpty ? {} : { color }}>
                        {isEmpty ? 'Not started' : `${value}%`}
                    </span>
                </div>
                <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: isEmpty ? 'transparent' : color }}
                    />
                </div>
            </div>
        </div>
    )
}

export default function ProgressPage() {
    const router = useRouter()
    const supabase = createClient()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [scores, setScores] = useState<Record<string, number>>({})
    const [stats, setStats] = useState<SkillData[]>([])
    const [earnedBadges, setEarnedBadges] = useState<string[]>([])
    const [recentSessions, setRecentSessions] = useState<SessionData[]>([])
    const [xpHistory, setXpHistory] = useState<{ name: string, xp: number }[]>([])
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return router.push('/login')

                const { data: p, error: pError } = await supabase.from('profiles').select('*').eq('id', user.id).single()

                if (pError || !p) {
                    console.error("Profile load error:", pError)
                    setHasError(true)
                    // Set a default empty profile
                    setProfile({
                        id: user.id,
                        xp: 0,
                        streak: 0,
                        earned_badges: '[]',
                        scores: '{}'
                    } as UserProfile)
                    setStats([
                        { subject: 'Speaking', A: 0, fullMark: 100 },
                        { subject: 'Grammar', A: 0, fullMark: 100 },
                        { subject: 'Listening', A: 0, fullMark: 100 },
                        { subject: 'Vocabulary', A: 0, fullMark: 100 },
                        { subject: 'Writing', A: 0, fullMark: 100 },
                    ])
                } else {
                    setProfile(p)
                    let badgesArr: string[] = []
                    try { badgesArr = JSON.parse(p.earned_badges || '[]') } catch { }
                    setEarnedBadges(badgesArr)

                    // Parse scores
                    let parsedScores: Record<string, number> = {}
                    try { parsedScores = JSON.parse(p.scores || '{}') } catch { }
                    setScores(parsedScores)

                    const skillData: SkillData[] = [
                        { subject: 'Speaking', A: parsedScores.speaking || 0, fullMark: 100 },
                        { subject: 'Grammar', A: parsedScores.grammar || 0, fullMark: 100 },
                        { subject: 'Listening', A: parsedScores.listening || 0, fullMark: 100 },
                        { subject: 'Vocabulary', A: parsedScores.vocabulary || 0, fullMark: 100 },
                        { subject: 'Writing', A: parsedScores.writing || 0, fullMark: 100 },
                    ]
                    setStats(skillData)
                }

                // Fetch recent 5 sessions
                const { data: sessions, error: sError } = await supabase
                    .from('sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (sError) {
                    console.error("Sessions load error:", sError)
                    setHasError(true)
                } else if (sessions) {
                    setRecentSessions(sessions)
                    // Build XP history from real sessions
                    const grouped: Record<string, number> = {}
                    sessions.slice().reverse().forEach((s: any) => {
                        const day = new Date(s.created_at).toLocaleDateString('en-US', { weekday: 'short' })
                        grouped[day] = (grouped[day] || 0) + (s.score || 0)
                    })
                    setXpHistory(Object.entries(grouped).map(([name, xp]) => ({ name, xp })))
                }
            } catch (err) {
                console.error("Unexpected load error:", err)
                setHasError(true)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [router, supabase])

    // Loading skeleton
    if (isLoading) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center text-white">
            <Zap className="w-8 h-8 text-[#6c63ff] animate-pulse" />
        </div>
    )

    if (!profile) return null

    const hasActivity = (profile.xp || 0) > 0 || recentSessions.length > 0

    const levelObj = LEVEL_THRESHOLDS.find(t => t.level === getLevelFromXP(profile.xp || 0)) || LEVEL_THRESHOLDS[0]
    const nextLevelObj = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(levelObj) + 1]
    const xpProgress = nextLevelObj
        ? Math.max(0, Math.min(100, ((profile.xp || 0) - levelObj.minXP) / (nextLevelObj.minXP - levelObj.minXP) * 100))
        : 100

    const readiness = Math.round(
        ((scores.speaking || 0) * 0.35) +
        ((scores.writing || 0) * 0.25) +
        ((scores.listening || 0) * 0.20) +
        ((scores.vocabulary || 0) * 0.20)
    )

    const streak = profile.streak || 0

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {hasError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-500 font-bold"
                    >
                        <span>⚠️ Could not load your data. Showing default view.</span>
                    </motion.div>
                )}

                {/* Back button */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-[#6c63ff]" /> Learning Progress
                        </h1>
                        <p className="text-zinc-400 text-lg">Track your growth and unlocked achievements.</p>
                    </div>

                    {/* Rank card */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 shrink-0">
                            <RiveNovaAvatar currentState="idle" className="w-full h-full" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Rank</p>
                            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">{levelObj.level}</h2>
                            <p className="text-sm font-bold text-[#6c63ff]">{profile.xp || 0} XP</p>
                        </div>
                        {nextLevelObj && (
                            <div className="w-48 hidden sm:block">
                                <div className="flex justify-between text-xs text-zinc-500 mb-2 font-bold">
                                    <span>{levelObj.level}</span>
                                    <span>{nextLevelObj.level}</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#6c63ff]" style={{ width: `${xpProgress}%` }} />
                                </div>
                                <p className="text-right text-[10px] text-zinc-500 mt-1">
                                    {(profile.xp || 0) === 0 ? 'Complete a lesson to earn XP' : `${nextLevelObj.minXP - (profile.xp || 0)} XP to Next Level`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── EMPTY STATE: No activity yet ───────────────────────── */}
                {!hasActivity ? (
                    <EmptyProgressState onStart={() => router.push('/learn')} />
                ) : (
                    /* ─── ACTIVE STATE: User has activity ─────────────────── */
                    <>
                        {/* Row 1: Streak + Interview Readiness + Skill Bars */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                            {/* Streak */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                <Flame className={`w-10 h-10 mb-3 ${streak > 0 ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]' : 'text-zinc-700'}`} />
                                <p className="text-4xl font-black text-white">{streak}</p>
                                <p className="text-sm font-bold text-zinc-400 mt-1">
                                    {streak === 0 ? 'No streak yet' : streak === 1 ? 'day streak' : 'day streak'}
                                </p>
                                {streak === 0 && (
                                    <p className="text-xs text-zinc-600 mt-2">Complete a lesson today to start your streak!</p>
                                )}
                            </div>

                            {/* Interview Readiness */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                <div className="relative w-24 h-24 mb-3">
                                    {/* Circular progress */}
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                        <circle
                                            cx="40" cy="40" r="32" fill="none"
                                            stroke={readiness === 0 ? 'rgba(255,255,255,0.1)' : '#6c63ff'}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 32}`}
                                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - readiness / 100)}`}
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-2xl font-black ${readiness === 0 ? 'text-zinc-600' : 'text-white'}`}>{readiness}%</span>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-zinc-300">Interview Readiness</p>
                                {readiness === 0 && (
                                    <p className="text-xs text-zinc-600 mt-1">Start practicing to build your score</p>
                                )}
                            </div>

                            {/* Total XP widget */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                <Zap className={`w-10 h-10 mb-3 ${(profile.xp || 0) > 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-zinc-700'}`} />
                                <p className="text-4xl font-black text-white">{profile.xp || 0}</p>
                                <p className="text-sm font-bold text-zinc-400 mt-1">Total XP</p>
                                {(profile.xp || 0) === 0 && (
                                    <p className="text-xs text-zinc-600 mt-2">Earn XP by completing lessons</p>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Skill Bars + Radar Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                            {/* Skill Bars */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-[#6c63ff]" /> Skill Levels
                                </h3>
                                <div className="space-y-5">
                                    {SKILL_CONFIG.map(skill => (
                                        <SkillBar
                                            key={skill.key}
                                            label={skill.label}
                                            icon={skill.icon}
                                            color={skill.color}
                                            value={scores[skill.key] || 0}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Radar Chart */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-[#6c63ff]" /> Skill Mastery
                                </h3>
                                <div className="h-64 sm:h-72 w-full relative" style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none">
                                        <p className={`text-3xl font-black drop-shadow-md ${readiness === 0 ? 'text-zinc-600' : 'text-[#6c63ff]'}`}>{readiness}%</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Ready</p>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats}>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Score" dataKey="A" stroke="#6c63ff" strokeWidth={2} fill="#6c63ff" fillOpacity={0.35} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: XP Chart + Sessions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                            {/* XP Growth Chart */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500" /> XP Growth History
                                </h3>
                                {xpHistory.length === 0 ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-600 border border-dashed border-white/10 rounded-2xl gap-3">
                                        <Zap className="w-8 h-8 text-zinc-700" />
                                        <p className="text-sm font-medium">No XP earned yet</p>
                                        <p className="text-xs text-zinc-700">Complete sessions to see your XP growth here</p>
                                    </div>
                                ) : (
                                    <div className="h-64 w-full" style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={xpHistory}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                                <Line type="monotone" dataKey="xp" stroke="#eab308" strokeWidth={3} dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#fff' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Recent Sessions */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-400" /> Recent Activity
                                </h3>
                                {recentSessions.length === 0 ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-white/10 rounded-2xl">
                                        <History className="w-8 h-8 text-zinc-700" />
                                        <p className="text-sm font-medium text-zinc-500">No sessions yet</p>
                                        <p className="text-xs text-zinc-600 max-w-[220px]">Your completed sessions will appear here once you start learning.</p>
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
                                                        <p className="font-bold capitalize text-zinc-200">{session.activity_type.replace('_', ' ')}</p>
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

                        {/* Speaking Leaderboard (Robust) */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8 mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-500" /> Weekly Speaking Leaders
                                </h3>
                                <div className="text-xs font-bold text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                    <Timer className="w-3 h-3" /> Ends in 02:45:10
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl text-center bg-black/20">
                                        <p className="text-zinc-500 font-bold mb-1">Leaderboard coming soon</p>
                                        <p className="text-xs text-zinc-600">Join the ranking by completing more speaking sessions!</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex flex-col items-center justify-center text-center p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                                        <Mic className="w-8 h-8 text-primary" />
                                    </div>
                                    <h4 className="font-bold text-white mb-2">Speak your way to the top!</h4>
                                    <p className="text-sm text-zinc-400">Practice speaking daily to earn points and climb the global voice leaderboard.</p>
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8">
                            <div className="flex justify-between items-end mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Badges Collection
                                </h3>
                                <p className="text-sm font-bold text-zinc-500">{earnedBadges.length} / {BADGES.length}</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {BADGES.map(b => {
                                    const isEarned = earnedBadges.includes(b.id)
                                    return (
                                        <div
                                            key={b.id}
                                            className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isEarned ? 'bg-gradient-to-br from-white/10 to-transparent border-white/20' : 'bg-black/30 border-white/5 opacity-40 grayscale'}`}
                                        >
                                            <div className="text-3xl mb-2">{b.icon}</div>
                                            <p className="text-sm font-bold text-white mb-1">{b.title}</p>
                                            <p className="text-[10px] text-zinc-400">{b.description}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            {earnedBadges.length === 0 && (
                                <div className="mt-6 text-center py-4 border-t border-white/5">
                                    <p className="text-sm text-zinc-600">Complete lessons and challenges to unlock badges 🏅</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
