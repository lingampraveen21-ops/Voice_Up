"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Briefcase, Clock, Play, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useNovaStore } from '@/store/useNovaStore'

type RoundType = 'Introduction' | 'Technical' | 'Behavioral' | 'Rapid Fire'

interface Question {
    text: string
    timeLimit: number
}

const ROUNDS: Record<RoundType, Question[]> = {
    Introduction: [
        { text: "Welcome to the interview. Please tell me about yourself.", timeLimit: 60 },
        { text: "What are you currently learning to improve your skills?", timeLimit: 60 }
    ],
    Technical: [
        { text: "Explain what a variable is in programming.", timeLimit: 90 },
        { text: "How would you explain a 'for loop' to a beginner?", timeLimit: 90 }
    ],
    Behavioral: [
        { text: "Tell me about a time you faced a difficult challenge at work.", timeLimit: 90 },
        { text: "How do you handle disagreements with team members?", timeLimit: 90 }
    ],
    "Rapid Fire": [
        { text: "What is your greatest strength?", timeLimit: 30 },
        { text: "Where do you see yourself in 5 years?", timeLimit: 30 },
        { text: "Why should we hire you?", timeLimit: 30 }
    ]
}

export default function MockInterviewPage() {
    const router = useRouter()
    const { isSupported, startListening, stopListening } = useVoiceRecorder()
    const { transcript: liveTranscript } = useNovaStore()
    const { speak } = useSpeechSynthesis()

    const [status, setStatus] = useState<'setup' | 'interviewing' | 'grading'>('setup')
    const [type, setType] = useState('Tech')
    const [duration, setDuration] = useState('20')
    const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const [answers, setAnswers] = useState<{ q: string, a: string }[]>([])
    const [currentAnswer, setCurrentAnswer] = useState('')

    const roundNames = Object.keys(ROUNDS) as RoundType[]
    const currentRoundName = roundNames[currentRoundIdx]
    const currentQuestion = ROUNDS[currentRoundName]?.[currentQuestionIdx]

    // Start Interview
    const handleStart = () => {
        setStatus('interviewing')
        speak("Welcome to the mock interview. I am Nova. Let's begin with the Introduction round.")
        setTimeout(() => prepareQuestion(), 4000)
    }

    const prepareQuestion = () => {
        const q = ROUNDS[roundNames[currentRoundIdx]][currentQuestionIdx]
        setTimeLeft(q.timeLimit)
        speak(q.text)
        // Wait for TTS to finish roughly then auto-start recording
        setTimeout(() => {
            if (isSupported) {
                try { startListening() } catch { /* ignore */ }
                setIsRecording(true)
                startTimer()
            }
        }, 3000)
    }

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleNextQuestion()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // Capture live transcript updates into currentAnswer
    useEffect(() => {
        if (liveTranscript) {
            setCurrentAnswer(prev => prev + " " + liveTranscript)
        }
    }, [liveTranscript])

    const handleNextQuestion = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (isRecording) {
            try { stopListening() } catch { /* ignore */ }
            setIsRecording(false)
        }

        setAnswers(prev => [...prev, { q: currentQuestion.text, a: currentAnswer || '(No audible response)' }])
        setCurrentAnswer('')

        const roundQuestions = ROUNDS[currentRoundName]
        if (currentQuestionIdx + 1 < roundQuestions.length) {
            setCurrentQuestionIdx(p => p + 1)
            setTimeout(prepareQuestion, 1000)
        } else if (currentRoundIdx + 1 < roundNames.length) {
            setCurrentRoundIdx(p => p + 1)
            setCurrentQuestionIdx(0)
            speak(`Moving on to the ${roundNames[currentRoundIdx + 1]} round.`)
            setTimeout(prepareQuestion, 3000)
        } else {
            finishInterview()
        }
    }

    const finishInterview = async () => {
        setStatus('grading')
        speak("Thank you, that concludes our interview. I am generating your performance report now.")

        try {
            const payload = {
                type: type,
                answers: [...answers, { q: currentQuestion.text, a: currentAnswer || '(No audible response)' }] // include last one
            }
            // Store payload in sessionStorage to pass to results page (real app might use context or db id)
            sessionStorage.setItem('mock_interview_payload', JSON.stringify(payload))

            // Artificial delay for UX
            setTimeout(() => {
                router.push('/test/mock-interview/results')
            }, 3000)
        } catch (err) {
            console.error(err)
            toast.error("Failed to process interview results.")
            setStatus('setup')
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    if (status === 'setup') {
        return (
            <div className="min-h-screen bg-[#080810] text-white flex items-center justify-center">
                <div className="max-w-xl w-full px-4">
                    <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

                        <Briefcase className="w-12 h-12 text-primary mx-auto mb-6 relative z-10" />
                        <h1 className="text-4xl font-black mb-3 relative z-10">Mock Interview</h1>
                        <p className="text-zinc-400 mb-10 relative z-10">Practice under pressure with AI interviewer NOVA</p>

                        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                            <div className="text-left">
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2 block">Interview Type</label>
                                <div className="space-y-2">
                                    {['Tech', 'HR', 'Mixed'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className={`w-full p-3 rounded-xl border text-sm transition-all ${type === t ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="text-left">
                                <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2 block">Estimated Duration</label>
                                <div className="space-y-2">
                                    {['20', '30'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDuration(d)}
                                            className={`w-full p-3 rounded-xl border text-sm flex items-center justify-center gap-2 transition-all ${duration === d ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}
                                        >
                                            <Clock className="w-4 h-4" /> {d} minutes
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <ul className="text-left text-sm text-zinc-400 space-y-2 mb-10 relative z-10 bg-black/40 p-4 rounded-xl border border-white/5">
                            <li>• Ensure your microphone is allowed.</li>
                            <li>• You will be timed for each question.</li>
                            <li>• Speak clearly and confidently.</li>
                            <li>• Ensure a quiet environment.</li>
                        </ul>

                        <button
                            onClick={handleStart}
                            className="w-full py-5 bg-gradient-to-r from-primary to-indigo-500 hover:opacity-90 font-bold text-lg rounded-2xl transition-opacity flex justify-center items-center gap-2 relative z-10 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                        >
                            <Play className="w-5 h-5 fill-white" /> Start Interview
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'grading') {
        return (
            <div className="min-h-screen bg-[#080810] text-white flex flex-col items-center justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                <h2 className="text-2xl font-bold mb-2">Analyzing Responses</h2>
                <p className="text-zinc-500">NOVA is grading your interview...</p>
            </div>
        )
    }

    // Interviewing State
    // Calculate timer color: white -> amber (under 10s) -> red (under 5s)
    const totalTime = currentQuestion?.timeLimit || 60
    const pct = (timeLeft / totalTime) * 100
    const barColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 15 ? 'bg-amber-500' : 'bg-primary'

    return (
        <div className="min-h-screen bg-[#020205] text-white flex flex-col">
            {/* Darker UI for interview mode */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                    <span className="text-xs uppercase tracking-widest text-primary font-bold">{currentRoundName} Round</span>
                    <p className="text-sm text-zinc-400">Question {currentQuestionIdx + 1} of {ROUNDS[currentRoundName].length}</p>
                </div>
                <div className="text-right">
                    <span className={`text-2xl font-mono font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        00:{timeLeft.toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Timer Bar */}
            <div className="h-1 bg-white/5 w-full">
                <div className={`h-full ${barColor} transition-all duration-1000 ease-linear`} style={{ width: `${pct}%` }} />
            </div>

            <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion?.text}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center justify-center text-center"
                    >
                        {/* NOVA Avatar placeholder (professional) */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-indigo-500/30 border border-primary/50 relative mb-8 flex flex-col items-center justify-center overflow-hidden">
                            <div className="w-12 h-12 bg-primary rounded-full blur-[10px] animate-pulse" />
                            <div className="absolute bottom-2 text-[10px] uppercase font-bold text-white/50 tracking-widest">NOVA</div>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-12 text-zinc-100">
                            &quot;{currentQuestion?.text}&quot;
                        </h2>

                        {isRecording ? (
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                                    <Mic className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-zinc-400 h-10 italic max-w-md line-clamp-2">
                                    {liveTranscript || "Listening..."}
                                </p>
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center">
                                <p className="text-zinc-500">Wait for NOVA to finish speaking...</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-auto pt-8 flex justify-end">
                    <button
                        onClick={handleNextQuestion}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        Skip & Next <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
