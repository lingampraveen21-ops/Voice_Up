"use client"

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Activity } from 'lucide-react'

interface SkillRadarChartProps {
    scores: {
        reading: number
        writing: number
        listening: number
        speaking: number
    }
}

import { useTranslations } from 'next-intl'

export const SkillRadarChart: FC<SkillRadarChartProps> = ({ scores }) => {
    const t = useTranslations("Dashboard")
    const data = [
        { subject: t('speaking'), A: scores.speaking, fullMark: 100 },
        { subject: t('listening'), A: scores.listening, fullMark: 100 },
        { subject: t('reading'), A: scores.reading, fullMark: 100 },
        { subject: t('writing'), A: scores.writing, fullMark: 100 },
    ];

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="col-span-1 md:col-span-2 bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center hover:border-primary/30 transition-colors group"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-primary/10 blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-colors" />

            <div className="w-full flex justify-between items-center mb-2 z-10">
                <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm tracking-wider uppercase">
                    <Activity className="w-4 h-4" /> {t("skillRadar")}
                </div>
            </div>

            <div style={{ width: '100%', minWidth: 0 }} className="z-10 h-[200px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Student"
                            dataKey="A"
                            stroke="#a855f7"
                            strokeWidth={3}
                            fill="#a855f7"
                            fillOpacity={0.3}
                            isAnimationActive={true}
                            animationBegin={200}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

        </motion.div>
    )
}
