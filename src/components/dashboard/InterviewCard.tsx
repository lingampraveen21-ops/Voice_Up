"use client"

import { FC, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ArrowRight, X } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import { Calendar } from '@/components/ui/Calendar'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface InterviewCardProps {
    interviewDate: string | null
    readinessScore: number // percentage
}

import { useTranslations } from 'next-intl'

export const InterviewCard: FC<InterviewCardProps> = ({ interviewDate: initialDate, readinessScore }) => {
    const t = useTranslations("Dashboard")
    const supabase = createClient()
    const [interviewDate, setInterviewDate] = useState<string | null>(initialDate)
    const [showPicker, setShowPicker] = useState(false)
    const [saving, setSaving] = useState(false)
    const pickerRef = useRef<HTMLDivElement>(null)

    const hasDate = Boolean(interviewDate)
    let daysLeft = 0
    if (hasDate && interviewDate) {
        daysLeft = Math.max(0, differenceInDays(new Date(interviewDate), new Date()))
    }

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false)
            }
        }
        if (showPicker) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showPicker])

    const handleDateSelect = async (day: Date | undefined) => {
        if (!day) return
        setSaving(true)
        try {
            const dateStr = format(day, 'yyyy-MM-dd')
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase
                .from('profiles')
                .update({ interview_date: dateStr })
                .eq('id', user.id)

            if (error) throw error

            setInterviewDate(dateStr)
            setShowPicker(false)
            toast.success("Interview date saved! 🎯")
        } catch (err) {
            console.error(err)
            toast.error("Failed to save interview date")
        } finally {
            setSaving(false)
        }
    }

    // Circular progress SVG logic
    const radius = 28
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (readinessScore / 100) * circumference

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between h-full hover:border-primary/30 transition-colors"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-colors" />

            {hasDate ? (
                <>
                    <div className="flex justify-between items-start z-10 w-full mb-4">
                        <div>
                            <p className="text-zinc-400 font-medium text-sm mb-1 uppercase tracking-wider">{t("nextInterview")}</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-black font-heading text-white">
                                    {daysLeft}
                                </h2>
                                <span className="text-zinc-400 font-medium">{t("daysLabel")}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPicker(true)}
                            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                        >
                            <CalendarIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="z-10 flex items-center gap-4 mt-auto p-3 rounded-2xl bg-white/5 border border-white/5">
                        {/* Readiness SVG Ring */}
                        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                {/* Track */}
                                <circle cx="32" cy="32" r={radius} className="fill-none stroke-white/10 stroke-[4]" />
                                {/* Progress indicator */}
                                <motion.circle
                                    cx="32" cy="32" r={radius}
                                    className="fill-none stroke-primary stroke-[4] stroke-linecap-round"
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                    style={{ strokeDasharray: circumference }}
                                />
                            </svg>
                            <span className="absolute text-xs font-bold text-white">{readinessScore}%</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight">{t("readinessScore")}</p>
                            <p className="text-xs text-zinc-400 mt-1">{t("basedOnTests")}</p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center z-10 p-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">{t("noInterview")}</p>
                    <button
                        onClick={() => setShowPicker(true)}
                        className="text-sm font-semibold text-primary inline-flex items-center gap-2 group-hover:text-primary-light transition-colors"
                    >
                        {t("setInterview")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            )}

            {/* Date Picker Overlay */}
            <AnimatePresence>
                {showPicker && (
                    <motion.div
                        ref={pickerRef}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-md rounded-3xl p-4 flex flex-col items-center justify-center"
                    >
                        <div className="flex items-center justify-between w-full mb-2 px-1">
                            <p className="text-sm font-bold text-white">Pick Interview Date</p>
                            <button onClick={() => setShowPicker(false)} className="text-zinc-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <Calendar
                            mode="single"
                            selected={interviewDate ? new Date(interviewDate) : undefined}
                            onSelect={handleDateSelect}
                            disabled={(date) => date < new Date()}
                            className="!p-2"
                        />
                        {saving && <p className="text-xs text-primary mt-2 animate-pulse">Saving...</p>}
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    )
}
