import { SupabaseClient } from '@supabase/supabase-js'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

// 1. XP Configuration
export const XP_REWARDS: Record<string, number> = {
    lesson: 50,
    quiz: 30,
    speaking: 40,
    writing: 35,
    challenge: 60,
    mock_interview: 100,
    test_checkpoint: 50,
    test_weekly: 75,
    test_levelup: 150
}

export const LEVEL_THRESHOLDS = [
    { level: 'Beginner', minXP: 0 },
    { level: 'Learner', minXP: 501 },
    { level: 'Speaker', minXP: 1501 },
    { level: 'Fluent', minXP: 3001 },
    { level: 'Master', minXP: 6001 }
]

export function getLevelFromXP(xp: number): string {
    const levelObj = [...LEVEL_THRESHOLDS].reverse().find(t => xp >= t.minXP)
    return levelObj ? levelObj.level : 'Beginner'
}

// 2. Badges Configuration
export interface Badge {
    id: string
    title: string
    description: string
    icon: string
    condition: (stats: UserStats) => boolean
}

interface UserStats {
    totalSessions: number
    streak: number
    grammarMistakesFixed: number
    mockInterviewHighScore: number
    passedLevelUp: boolean
    speedReadingDone: boolean
    writingHighScore: number
    challengesWon: number
    xpToday: number
}

export const BADGES: Badge[] = [
    { id: 'first_voice', title: 'First Voice', description: 'Complete first speaking session', icon: '🎤', condition: (s) => s.totalSessions >= 1 },
    { id: 'week_warrior', title: 'Week Warrior', description: '7-day streak', icon: '🔥', condition: (s) => s.streak >= 7 },
    { id: 'month_master', title: 'Month Master', description: '30-day streak', icon: '🔥', condition: (s) => s.streak >= 30 },
    { id: 'grammar_pro', title: 'Grammar Pro', description: 'Fix 50 grammar mistakes', icon: '📝', condition: (s) => s.grammarMistakesFixed >= 50 },
    { id: 'interview_ready', title: 'Interview Ready', description: 'Score 80%+ mock interview', icon: '🏆', condition: (s) => s.mockInterviewHighScore >= 80 },
    { id: 'level_up', title: 'Level Up', description: 'Pass any Level-Up Test', icon: '🎓', condition: (s) => s.passedLevelUp },
    { id: 'speed_reader', title: 'Speed Reader', description: 'Complete speed reading', icon: '⚡', condition: (s) => s.speedReadingDone },
    { id: 'email_pro', title: 'Email Pro', description: 'Score high in writing task', icon: '💌', condition: (s) => s.writingHighScore >= 90 },
    { id: 'challenge_king', title: 'Challenge King', description: 'Win daily challenge', icon: '🎯', condition: (s) => s.challengesWon >= 1 },
    { id: 'century', title: 'Century', description: '100 XP in one day', icon: '💪', condition: (s) => s.xpToday >= 100 },
]

export function evaluateBadges(currentEarnedIds: string[], stats: UserStats): string[] {
    const newlyEarned: string[] = []
    BADGES.forEach(badge => {
        if (!currentEarnedIds.includes(badge.id) && badge.condition(stats)) {
            newlyEarned.push(badge.id)
        }
    })
    return newlyEarned
}

// 3. Centralized progress updater
export async function trackSessionProgress(
    supabase: SupabaseClient,
    userId: string,
    sessionType: string,
    score: number = 0
) {
    try {
        // 1. Fetch current profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (!profile) return

        // 2. Calculate newly earned XP
        const earnedXP = XP_REWARDS[sessionType] || 10
        const newTotalXP = (profile.xp || 0) + earnedXP

        // Check for level up
        const oldLevel = getLevelFromXP(profile.xp || 0)
        const newLevel = getLevelFromXP(newTotalXP)
        if (newLevel !== oldLevel) {
            toast.success(`Level Up! You are now a ${newLevel} 🌟`, { duration: 5000 })
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        }

        // 3. Update Streak Logic (simplified client-side implementation of DB function)
        let newStreak = profile.streak_count || 0
        const todayStr = new Date().toISOString().split('T')[0]
        const lastActiveStr = profile.last_active_date ? new Date(profile.last_active_date).toISOString().split('T')[0] : null

        if (lastActiveStr !== todayStr) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]

            if (lastActiveStr === yesterdayStr) {
                // Consecutive day
                newStreak += 1
                if (newStreak === 7 || newStreak === 30) {
                    toast.success(`Amazing! ${newStreak} day streak! 🔥`)
                    confetti({ particleCount: 150, zIndex: 9999 })
                }
            } else if (lastActiveStr !== null) {
                // Streak broken
                newStreak = 1
                toast('Your streak was reset, but keeping going! 🔥')
            } else {
                // First time
                newStreak = 1
            }
        }

        // 4. Update Profile
        await supabase.from('profiles').update({
            xp: newTotalXP,
            streak_count: newStreak,
            last_active_date: new Date().toISOString()
        }).eq('id', userId)

        // 5. Check badges (Pseudo-evaluating for demo purposes without complex aggregate queries)
        // In full app, stats are aggregated from DB over `sessions` table.
        const mockStats: UserStats = {
            totalSessions: 1, // trigger at least first voice
            streak: newStreak,
            grammarMistakesFixed: 0,
            mockInterviewHighScore: sessionType === 'mock_interview' ? score : 0,
            passedLevelUp: sessionType === 'test_levelup' && score >= 85,
            speedReadingDone: sessionType === 'reading',
            writingHighScore: sessionType === 'writing' ? score : 0,
            challengesWon: 0,
            xpToday: earnedXP // simplified
        }

        const earnedBadgesStr = profile.earned_badges || '[]'
        let earnedBadgesArr: string[] = []
        try { earnedBadgesArr = JSON.parse(earnedBadgesStr) } catch { }

        const newlyUnlocked = evaluateBadges(earnedBadgesArr, mockStats)

        if (newlyUnlocked.length > 0) {
            const combinedBadges = [...earnedBadgesArr, ...newlyUnlocked]
            await supabase.from('profiles').update({ earned_badges: JSON.stringify(combinedBadges) }).eq('id', userId)

            newlyUnlocked.forEach(id => {
                const badgeInfo = BADGES.find(b => b.id === id)
                if (badgeInfo) {
                    toast.success(`Badge Unlocked: ${badgeInfo.icon} ${badgeInfo.title}!`)
                    confetti({ spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] })
                }
            })
        }

        // Return values if component needs them
        return { earnedXP, newTotalXP, newLevel, newStreak }
    } catch (e) {
        console.error("Progress tracking error:", e)
    }
}
