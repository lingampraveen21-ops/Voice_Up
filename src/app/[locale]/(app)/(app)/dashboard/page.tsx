"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/Skeleton'
import { GreetingCard } from '@/components/dashboard/GreetingCard'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { InterviewCard } from '@/components/dashboard/InterviewCard'
import { ContinueLearningCard } from '@/components/dashboard/ContinueLearningCard'
import { SkillRadarChart } from '@/components/dashboard/SkillRadarChart'
import { XPCard } from '@/components/dashboard/XPCard'
import { DailyGoalRing } from '@/components/dashboard/DailyGoalRing'
import { ChallengeCard } from '@/components/dashboard/ChallengeCard'
import { NovaSuggestionCard } from '@/components/dashboard/NovaSuggestionCard'
import { BadgesRow } from '@/components/dashboard/BadgesRow'

interface ProfileData {
    full_name: string | null
    streak_count: number
    streak_freeze_available: boolean
    last_active_date: string | null
    xp: number
    voiceup_score: number
    reading_score: number
    writing_score: number
    listening_score: number
    speaking_score: number
}

const DashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:col-span-4 gap-6">
        <Skeleton className="col-span-full md:col-span-1 h-[280px] rounded-3xl" />
        <Skeleton className="col-span-1 h-[280px] rounded-3xl" />
        <Skeleton className="col-span-1 h-[280px] rounded-3xl" />
        <Skeleton className="col-span-full h-[200px] rounded-3xl" />
        <Skeleton className="col-span-full lg:col-span-2 h-[320px] rounded-3xl" />
        <Skeleton className="col-span-1 h-[320px] rounded-3xl" />
        <Skeleton className="col-span-1 h-[320px] rounded-3xl" />
    </div>
)

export default function DashboardPage() {
    const supabase = createClient()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                if (data) setProfile(data)
            }
            setLoading(false)
        }
        fetchProfile()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return (
        <div className="min-h-screen bg-[#080810] text-white p-4 md:p-12">
            <DashboardSkeleton />
        </div>
    )

    const scores = {
        reading: profile?.reading_score || 0,
        writing: profile?.writing_score || 0,
        listening: profile?.listening_score || 0,
        speaking: profile?.speaking_score || 0,
    }

    // Calculate readiness (average of skills)
    const totalSkill = scores.reading + scores.writing + scores.listening + scores.speaking
    const readinessScore = Math.min(100, Math.round((totalSkill / 100) * 100))

    return (
        <div className="min-h-screen bg-[#080810] text-white p-4 md:p-8 lg:p-12 overflow-x-hidden">

            {/* Background ambient light */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none z-0" />

            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
                initial="hidden"
                animate="show"
                className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative z-10"
            >
                {/* ROW 1 */}
                <GreetingCard
                    name={profile?.full_name?.split(' ')[0] || "Guest"}
                    streak={profile?.streak_count || 0}
                />
                <div className="col-span-1 border-white/10 rounded-3xl h-[280px]">
                    <StreakCard
                        streak={profile?.streak_count || 0}
                        freezeAvailable={profile?.streak_freeze_available || false}
                    />
                </div>
                <div className="col-span-1 lg:col-span-1 border-white/10 rounded-3xl h-[280px]">
                    <InterviewCard
                        interviewDate={profile?.last_active_date || null} // Null for now unless passed explicitly through onboarding
                        readinessScore={readinessScore}
                    />
                </div>

                {/* ROW 2 */}
                <ContinueLearningCard />

                {/* ROW 3 */}
                <SkillRadarChart scores={scores} />
                <div className="col-span-1 border-white/10 rounded-3xl h-[320px]">
                    <XPCard xp={profile?.xp || profile?.voiceup_score || 0} />
                </div>
                <div className="col-span-1 border-white/10 rounded-3xl h-[320px]">
                    <DailyGoalRing />
                </div>

                {/* ROW 4 */}
                <ChallengeCard />
                <div className="col-span-1 md:col-span-1 lg:col-span-2 border-white/10 rounded-3xl h-[280px]">
                    <NovaSuggestionCard scores={scores} />
                </div>

                {/* ROW 5 */}
                <BadgesRow />

            </motion.div>
        </div>
    )
}
