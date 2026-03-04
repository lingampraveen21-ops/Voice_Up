"use client"

import { useOnboardingStore } from "@/store/useOnboardingStore"
import { motion } from "framer-motion"
import { Briefcase, GraduationCap, MessageCircle, Rocket, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { GradientButton } from "@/components/ui/GradientButton"

const goals = [
    { id: "interview", icon: Briefcase, title: "Job Interview", color: "from-blue-500/20 to-cyan-500/20", text: "text-blue-400" },
    { id: "academic", icon: GraduationCap, title: "Academic English", color: "from-purple-500/20 to-fuchsia-500/20", text: "text-purple-400" },
    { id: "everyday", icon: MessageCircle, title: "Everyday English", color: "from-emerald-500/20 to-teal-500/20", text: "text-emerald-400" },
    { id: "advanced", icon: Rocket, title: "Advanced Fluency", color: "from-rose-500/20 to-orange-500/20", text: "text-rose-400" },
]

export default function GoalSelectionPage() {
    const { goal, setGoal } = useOnboardingStore()
    const router = useRouter()

    const handleNext = () => {
        if (goal) router.push('/onboarding/time')
    }

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
                    Hi! I&apos;m NOVA. What&apos;s your main goal?
                </h1>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4 md:px-0">
                {goals.map((g, i) => {
                    const isSelected = goal === g.id
                    const Icon = g.icon

                    return (
                        <motion.button
                            key={g.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setGoal(g.id)}
                            className={`relative p-6 rounded-2xl border text-left flex flex-col items-start gap-4 transition-all duration-300 overflow-hidden ${isSelected
                                    ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <div className={`absolute top-4 right-4 transition-transform duration-300 ${isSelected ? "scale-100" : "scale-0"}`}>
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl bg-gradient-to-br ${g.color}`}>
                                <Icon className={`w-8 h-8 ${g.text}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-heading text-white">{g.title}</h3>
                            </div>
                        </motion.button>
                    )
                })}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 w-full max-w-xs"
            >
                <GradientButton
                    onClick={handleNext}
                    disabled={!goal}
                    className="w-full py-6 pr-4 relative group"
                >
                    Next Step
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform">→</span>
                </GradientButton>
            </motion.div>
        </div>
    )
}
