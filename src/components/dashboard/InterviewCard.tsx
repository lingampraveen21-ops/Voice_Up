import { FC } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'
import { differenceInDays } from 'date-fns'

interface InterviewCardProps {
    interviewDate: string | null
    readinessScore: number // percentage
}

import { useTranslations } from 'next-intl'

export const InterviewCard: FC<InterviewCardProps> = ({ interviewDate, readinessScore }) => {
    const t = useTranslations("Dashboard")
    const hasDate = Boolean(interviewDate)
    let daysLeft = 0
    if (hasDate && interviewDate) {
        daysLeft = Math.max(0, differenceInDays(new Date(interviewDate), new Date()))
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
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Calendar className="w-5 h-5" />
                        </div>
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
                        <Calendar className="w-6 h-6 text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">{t("noInterview")}</p>
                    <button className="text-sm font-semibold text-primary inline-flex items-center gap-2 group-hover:text-primary-light transition-colors">
                        {t("setInterview")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            )}

        </motion.div>
    )
}
