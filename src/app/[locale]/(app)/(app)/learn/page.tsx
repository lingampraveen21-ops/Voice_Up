"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Lock, CheckCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MODULES } from '@/data/lessons'
import type { Lesson } from '@/data/lessons'

export default function LearnPage() {
    const router = useRouter()
    const supabase = createClient()
    const [expandedModule, setExpandedModule] = useState<string>('mod-1')
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProgress = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }
            const { data } = await supabase
                .from('sessions')
                .select('lesson_id')
                .eq('user_id', user.id)
                .eq('activity_type', 'quiz')
                .gte('score', 70)
            if (data) setCompletedLessons(new Set(data.map((s: { lesson_id: string }) => s.lesson_id)))
            setLoading(false)
        }
        fetchProgress()
    }, []) // eslint-disable-line

    const isLessonUnlocked = (lesson: Lesson, moduleId: string) => {
        if (lesson.order === 1) return true
        const prevLesson = MODULES.find(m => m.id === moduleId)?.lessons.find(l => l.order === lesson.order - 1)
        return prevLesson ? completedLessons.has(prevLesson.id) : false
    }

    const totalLessons = MODULES.flatMap(m => m.lessons).length
    const completedCount = completedLessons.size
    const overallProgress = Math.round((completedCount / totalLessons) * 100)

    return (
        <div className="min-h-screen bg-[#080810] text-white">
            <div className="max-w-3xl mx-auto px-4 py-12">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <h1 className="text-3xl font-bold mb-1">Your Learning Path</h1>
                    <p className="text-zinc-400 text-sm mb-5">{completedCount} of {totalLessons} lessons completed</p>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                        <span>0%</span>
                        <span className="text-primary font-bold">{overallProgress}% Complete</span>
                        <span>100%</span>
                    </div>
                </motion.div>

                {/* Modules */}
                <div className="space-y-4">
                    {MODULES.map((module, i) => {
                        const moduleDone = module.lessons.filter(l => completedLessons.has(l.id)).length
                        const isExpanded = expandedModule === module.id

                        return (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden"
                            >
                                {/* Module Header */}
                                <button
                                    onClick={() => setExpandedModule(isExpanded ? '' : module.id)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{module.icon}</span>
                                        <div className="text-left">
                                            <p className="font-semibold text-white">{module.title}</p>
                                            <p className="text-xs text-zinc-500">{module.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-zinc-400 hidden sm:block">{moduleDone}/{module.lessons.length}</span>
                                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                            <ChevronDown className="w-5 h-5 text-zinc-500" />
                                        </motion.div>
                                    </div>
                                </button>

                                {/* Module Progress Bar */}
                                <div className="h-0.5 bg-white/5">
                                    <div
                                        className="h-full bg-primary transition-all duration-700"
                                        style={{ width: `${(moduleDone / module.lessons.length) * 100}%` }}
                                    />
                                </div>

                                {/* Lessons */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 space-y-2">
                                                {module.lessons.map((lesson) => {
                                                    const isComplete = completedLessons.has(lesson.id)
                                                    const isUnlocked = !loading && isLessonUnlocked(lesson, module.id)
                                                    const isCurrent = isUnlocked && !isComplete

                                                    return (
                                                        <button
                                                            key={lesson.id}
                                                            onClick={() => isUnlocked && router.push(`/learn/${lesson.id}`)}
                                                            disabled={!isUnlocked}
                                                            className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' :
                                                                isCurrent ? 'bg-primary/10 border border-primary/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]' :
                                                                    'bg-white/5 border border-white/5 opacity-40'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-emerald-500/20' : isCurrent ? 'bg-primary/20' : 'bg-white/10'
                                                                }`}>
                                                                {isComplete ? (
                                                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                                ) : !isUnlocked ? (
                                                                    <Lock className="w-4 h-4 text-zinc-500" />
                                                                ) : (
                                                                    <span className="text-sm font-bold text-primary">{lesson.order}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-medium text-sm truncate ${isComplete ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-zinc-400'}`}>
                                                                    {lesson.title}
                                                                </p>
                                                                <p className="text-xs text-zinc-600 mt-0.5">{lesson.level} · {lesson.duration} min</p>
                                                            </div>
                                                            {isCurrent && (
                                                                <div className="flex items-center gap-1 text-xs font-bold text-primary">
                                                                    Continue <ArrowRight className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
