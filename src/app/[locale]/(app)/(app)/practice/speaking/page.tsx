"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useNovaStore } from '@/store/useNovaStore'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { createClient } from '@/lib/supabase/client'
import { RiveNovaAvatar } from '@/components/ui/RiveNovaAvatar'
import { useTranslations } from 'next-intl'
import { useFeedbackStore } from '@/store/useFeedbackStore'
import { MicConsentModal } from '@/components/shared/MicConsentModal'

interface SpeakingProfileData {
    id: string
    xp: number
    speaking_score: number
    cefr_level: string
}

export default function SpeakingPracticePage() {
    const router = useRouter()
    const supabase = createClient()
    const t = useTranslations("Practice.speaking")
    const openFeedback = useFeedbackStore(state => state.openFeedback)

    const {
        isListening,
        transcript,
        isThinking,
        isSpeaking,
        setListening,
        setTranscript,
        setThinking,
        setSpeaking,
        addMessageToHistory,
        conversationHistory,
        resetSession
    } = useNovaStore()

    const { isSupported, startRecording: startListening, stopRecording: stopListening, error: micError } = useVoiceRecorder()
    const { speak, stop: stopSpeaking } = useSpeechSynthesis()

    const [profile, setProfile] = useState<SpeakingProfileData | null>(null)
    const [novaMessage, setNovaMessage] = useState("")
    const [correction, setCorrection] = useState<{ original: string, corrected: string, explanation: string } | null>(null)
    const [mistakes, setMistakes] = useState<string[]>([])
    const [topic] = useState("Career Development")
    const [exchangeCount, setExchangeCount] = useState(0)
    const [sessionScore, setSessionScore] = useState(100)
    const [sessionComplete, setSessionComplete] = useState(false)
    const [showConsent, setShowConsent] = useState(false)
    const silenceTimer = useRef<NodeJS.Timeout | null>(null)
    const MAX_EXCHANGES = 5

    // 1. Initial Setup
    useEffect(() => {
        resetSession()

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setProfile(data)
            }
        }
        fetchUser()

        const consentApproved = localStorage.getItem('mic_consent_approved')
        if (consentApproved !== 'true') {
            setShowConsent(true)
        } else {
            const greeting = t("novaGreeting")
            setNovaMessage(greeting)
            speak(greeting)
        }

        return () => {
            stopSpeaking()
            if (silenceTimer.current) clearTimeout(silenceTimer.current)
        }
    }, []) // eslint-disable-line

    // 2. Transmit to API when User stops talking
    useEffect(() => {
        const processTranscript = async () => {
            if (!isListening && transcript.trim().length > 0 && !isThinking && !isSpeaking) {
                setThinking(true)
                addMessageToHistory({ role: 'user', content: transcript })

                if (silenceTimer.current) clearTimeout(silenceTimer.current)

                try {
                    const res = await fetch('/api/nova', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userMessage: transcript,
                            conversationHistory,
                            topic,
                            userLevel: profile?.cefr_level || "Beginner"
                        })
                    })

                    if (!res.ok) throw new Error("API Route failed")
                    const data = await res.json()

                    setThinking(false)
                    setNovaMessage(data.novaResponse)
                    addMessageToHistory({ role: 'nova', content: data.novaResponse })

                    if (data.grammarMistake && data.correction) {
                        setCorrection(data.correction)
                        setMistakes(prev => [...prev, data.correction.corrected])
                        setSessionScore(prev => Math.max(0, prev - 5))
                    } else {
                        setCorrection(null)
                        setSessionScore(prev => Math.min(100, prev + 2))
                    }

                    setExchangeCount(prev => prev + 1)
                    speak(data.novaResponse)

                } catch (error) {
                    console.error("Failed to generate NOVA response:", error)
                    toast.error("NOVA is having trouble connecting to the network.")
                    setThinking(false)
                }
            }
        }

        processTranscript()
    }, [isListening]) // eslint-disable-line

    // 3. Silence Detection Logic
    useEffect(() => {
        if (!isListening && !isSpeaking && !isThinking && !sessionComplete) {
            silenceTimer.current = setTimeout(() => {
                if (transcript.length === 0) {
                    const nudge = t("nudge")
                    setNovaMessage(nudge)
                    speak(nudge)
                }
            }, 8000)
        }

        return () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current)
        }
    }, [isListening, isSpeaking, isThinking, transcript, sessionComplete]) // eslint-disable-line

    // 4. Session Completion Hook
    useEffect(() => {
        if (exchangeCount >= MAX_EXCHANGES && !isSpeaking && !isThinking && !sessionComplete) {
            setSessionComplete(true)
            saveSessionToSupabase().then(id => {
                if (id) {
                    setTimeout(() => openFeedback(id), 2000)
                }
            })
        }
    }, [exchangeCount, isSpeaking, isThinking]) // eslint-disable-line

    const saveSessionToSupabase = async () => {
        if (!profile) return null
        try {
            const xpEarned = Math.max(10, sessionScore)

            const { data, error } = await supabase.from('sessions').insert({
                user_id: profile.id,
                skill: 'speaking',
                duration_seconds: 300,
                score: sessionScore,
                xp_earned: xpEarned
            }).select('id').single()

            if (error) throw error

            await supabase.rpc('add_xp', { p_user_id: profile.id, p_amount: xpEarned })
            await supabase.rpc('update_scores', { p_user_id: profile.id, p_skill: 'speaking', p_new_score: Math.min(100, (profile.speaking_score || 0) + Math.round(sessionScore / 20)) })

            toast.success(t("sessionComplete", { xp: xpEarned }))
            return data?.id
        } catch (e) {
            console.error('Error saving session', e)
            return null
        }
    }

    if (!isSupported) {
        return (
            <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <Mic className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{t("notSupportedTitle")}</h1>
                <p className="text-zinc-400 max-w-md mx-auto mb-8">{t("notSupportedDesc")}</p>
                <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                    {t("returnBtn")}
                </button>
            </div>
        )
    }

    let currentState: 'idle' | 'listening' | 'thinking' | 'speaking' = 'idle'
    if (isListening) currentState = 'listening'
    else if (isThinking) currentState = 'thinking'
    else if (isSpeaking) currentState = 'speaking'

    return (
        <div className="min-h-screen bg-[#080810] text-white flex flex-col relative overflow-hidden">
            <AnimatePresence>
                {showConsent && (
                    <MicConsentModal
                        onAllow={() => {
                            localStorage.setItem('mic_consent_approved', 'true')
                            setShowConsent(false)
                            const greeting = t("novaGreeting")
                            setNovaMessage(greeting)
                            speak(greeting)
                        }}
                        onCancel={() => router.push('/dashboard')}
                    />
                )}
            </AnimatePresence>

            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

            <header className="flex items-center justify-between p-6 z-10 w-full max-w-4xl mx-auto">
                <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold tracking-wider uppercase text-zinc-400">{topic}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${(exchangeCount / MAX_EXCHANGES) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{exchangeCount}/{MAX_EXCHANGES}</span>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold text-amber-400">
                    {sessionScore} <span className="text-zinc-500">{t("pts")}</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-4xl mx-auto mb-24">
                <div className="relative mb-12">
                    <RiveNovaAvatar currentState={currentState} className="w-40 h-40 md:w-56 md:h-56 z-10" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={novaMessage}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-[110%] left-1/2 -translate-x-1/2 w-80 md:w-[400px] bg-white text-black p-4 rounded-2xl rounded-tl-sm shadow-2xl text-center z-20"
                        >
                            <p className="font-medium text-[15px] leading-relaxed relative">{novaMessage}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="w-full max-w-2xl mt-16 min-h-[100px] flex flex-col items-center justify-center text-center">
                    <AnimatePresence mode="wait">
                        {correction ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white/5 border border-primary/30 p-4 rounded-2xl w-full"
                            >
                                <div className="text-red-400 line-through mb-1">&quot;{correction.original}&quot;</div>
                                <div className="text-emerald-400 font-bold mb-2">&quot;{correction.corrected}&quot;</div>
                                {correction.explanation && <div className="text-sm text-zinc-400">{correction.explanation}</div>}
                            </motion.div>
                        ) : (
                            <p className={`text-xl md:text-2xl font-medium transition-colors ${isListening ? 'text-white' : 'text-zinc-500'}`}>
                                {transcript || (isListening ? t("listening") : t("tapToSpeak"))}
                            </p>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#080810] via-[#080810]/80 to-transparent flex items-end justify-center z-20">
                {sessionComplete ? (
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                        {t("returnBtn")}
                    </button>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        {micError && <p className="text-red-400 text-xs mb-2">{micError}</p>}
                        <button
                            onClick={isListening ? stopListening : startListening}
                            disabled={isSpeaking || isThinking}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isListening
                                ? 'bg-red-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-110'
                                : 'bg-gradient-to-br from-secondary to-orange-500 hover:scale-105 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                                }`}
                        >
                            {isListening ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-white" />}
                        </button>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{isListening ? t("recording") : t("holdToSpeak")}</span>
                    </div>
                )}
            </footer>
        </div>
    )
}
