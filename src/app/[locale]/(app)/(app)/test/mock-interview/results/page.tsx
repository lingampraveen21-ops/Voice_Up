"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface MockGradeResult {
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
    readyPercentage: number
    scores: {
        fluency: number
        grammar: number
        vocabulary: number
        technical: number
        confidence: number
    }
    topMistakes: {
        original: string
        corrected: string
        explanation: string
    }[]
    feedback: string
}

export default function MockInterviewResultsPage() {
    const router = useRouter()
    const supabase = createClient()
    const [result, setResult] = useState<MockGradeResult | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const processInterview = async () => {
            try {
                const rawPayload = sessionStorage.getItem('mock_interview_payload')
                if (!rawPayload) {
                    setError('No interview data found.')
                    setLoading(false)
                    return
                }

                const payload = JSON.parse(rawPayload)

                const response = await fetch('/api/mock-interview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })

                if (!response.ok) throw new Error('Grading failed')

                const data: MockGradeResult = await response.json()
                setResult(data)

                // Save to Supabase
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase.from('sessions').insert({
                        user_id: user.id,
                        type: 'mock_interview',
                        score: data.readyPercentage,
                        mistakes_count: data.topMistakes.length,
                        duration_seconds: 20
                    })
                }

                sessionStorage.removeItem('mock_interview_payload')
            } catch (err) {
                console.error(err)
                setError('Failed to grade the interview. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        processInterview()
    }, [supabase])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080810] text-white flex flex-col items-center justify-center p-4 text-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-8" />
                <h2 className="text-3xl font-bold mb-4">NOVA is analyzing your interview...</h2>
                <div className="flex flex-col gap-3 text-zinc-400 text-sm max-w-sm">
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Transcribing 4 rounds of audio</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Evaluating technical accuracy</p>
                    <p className="flex items-center gap-2 animate-pulse"><Loader2 className="w-4 h-4 animate-spin text-primary" /> Grading grammar and fluency</p>
                </div>
            </div>
        )
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-[#080810] text-white flex flex-col items-center justify-center p-4 text-center">
                <XCircle className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
                <p className="text-zinc-400 mb-8 max-w-md">{error}</p>
                <button onClick={() => router.push('/dashboard')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-bold">
                    Return to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#080810] text-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>

                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black mb-4">Interview Scorecard</h1>
                    <p className="text-zinc-400 text-lg">{result.feedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="md:col-span-1 bg-gradient-to-br from-primary/20 to-indigo-500/10 border border-primary/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
                        <div className="w-full absolute top-0 h-1 bg-gradient-to-r from-primary to-indigo-500" />
                        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Grade</p>
                        <p className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2">{result.overallGrade}</p>
                        <p className="text-lg font-bold text-primary">{result.readyPercentage}% Ready</p>
                    </div>

                    <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Performance Breakdown</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Fluency', score: result.scores.fluency, color: 'bg-emerald-500' },
                                { label: 'Grammar', score: result.scores.grammar, color: 'bg-blue-500' },
                                { label: 'Vocabulary', score: result.scores.vocabulary, color: 'bg-primary' },
                                { label: 'Technical', score: result.scores.technical, color: 'bg-amber-500' },
                                { label: 'Confidence', score: result.scores.confidence, color: 'bg-indigo-500' },
                            ].map(metric => (
                                <div key={metric.label}>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-zinc-300">{metric.label}</span>
                                        <span>{metric.score}/100</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metric.score}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className={`h-full ${metric.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {result.topMistakes.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">Top Areas for Improvement</h3>
                        <div className="space-y-4">
                            {result.topMistakes.map((mistake, idx) => (
                                <div key={idx} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <p className="text-xs text-red-400/80 font-bold uppercase tracking-wider mb-2">You Said</p>
                                        <div className="flex items-start gap-4">
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                                            <p className="text-zinc-300 line-through decoration-red-500/50 decoration-2">{mistake.original}</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-center">
                                        <ChevronRight className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider mb-2">Better Version</p>
                                        <div className="flex items-start gap-4 mb-4">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                                            <p className="text-white font-medium">{mistake.corrected}</p>
                                        </div>
                                        <p className="text-sm text-zinc-400 bg-black/40 p-4 rounded-xl border border-white/5">{mistake.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => router.push('/test/mock-interview')}
                        className="flex-1 py-5 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl font-bold flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" /> Try Again
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 py-5 bg-primary hover:bg-primary/90 transition-colors text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
