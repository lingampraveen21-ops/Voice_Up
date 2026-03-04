"use client"

import { useOnboardingStore } from "@/store/useOnboardingStore"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { GradientButton } from "@/components/ui/GradientButton"
import { Calendar } from "@/components/ui/Calendar"
import { CalendarIcon } from "lucide-react"
import { differenceInDays, format } from "date-fns"

export default function InterviewDatePage() {
    const { interviewDate, setInterviewDate } = useOnboardingStore()
    const router = useRouter()

    const handleNext = () => {
        // Navigate to placement test
        router.push('/test/placement')
    }

    const handleBack = () => {
        router.push('/onboarding/time')
    }

    const daysUntil = interviewDate ? differenceInDays(interviewDate, new Date()) : null

    return (
        <div className="flex flex-col items-center justify-center w-full mt-12 mb-24">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm mb-4">
                    Chatting with NOVA
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">
                    Do you have an interview coming up?
                </h1>
                <p className="text-zinc-400 mt-2">
                    Select a date to set up a countdown, or skip for now.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-6"
            >
                <Calendar
                    mode="single"
                    selected={interviewDate || undefined}
                    onSelect={(date) => setInterviewDate(date ?? null)}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    className="mx-auto"
                />

                <AnimatePresence>
                    {interviewDate && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-center overflow-hidden"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
                                <CalendarIcon className="w-4 h-4" />
                                <span className="font-semibold">{format(interviewDate, 'MMMM d, yyyy')}</span>
                            </div>
                            <p className="text-sm text-zinc-400 mt-2">
                                {daysUntil === 0
                                    ? "Interview is today! Good luck! 🎯"
                                    : `${daysUntil} days left to prepare! 💪`}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 w-full max-w-sm flex flex-col items-center gap-4 px-4"
            >
                <GradientButton
                    onClick={handleNext}
                    className="w-full py-6 pr-4 relative group"
                >
                    Let&apos;s Start Placement!
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform">→</span>
                </GradientButton>
                <div className="flex w-full items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 text-zinc-500 hover:text-white transition-colors text-sm"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm underline underline-offset-4"
                    >
                        Skip for now
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
