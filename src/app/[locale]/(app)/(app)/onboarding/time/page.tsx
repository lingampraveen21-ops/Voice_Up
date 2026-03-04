"use client"

import { useOnboardingStore } from "@/store/useOnboardingStore"
import { motion } from "framer-motion"
import { Zap, Flame, Dumbbell, Rocket, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { GradientButton } from "@/components/ui/GradientButton"

import { useTranslations } from "next-intl"

export default function TimeSelectionPage() {
    const t = useTranslations("Onboarding")
    const { timeCommitment, setTimeCommitment } = useOnboardingStore()
    const router = useRouter()

    const times = [
        { id: "10", icon: Zap, title: t("timeCasualDesc"), label: t("timeCasualTitle"), color: "from-blue-500/20 to-cyan-500/20", text: "text-blue-400" },
        { id: "20", icon: Flame, title: t("timeRegularDesc"), label: t("timeRegularTitle"), color: "from-orange-500/20 to-red-500/20", text: "text-orange-400" },
        { id: "30", icon: Dumbbell, title: t("timeSeriousDesc"), label: t("timeSeriousTitle"), color: "from-purple-500/20 to-fuchsia-500/20", text: "text-purple-400" },
        { id: "60", icon: Rocket, title: "1 hour", label: "Fast Track", color: "from-rose-500/20 to-pink-500/20", text: "text-rose-400" },
    ]

    const handleNext = () => {
        if (timeCommitment) router.push('/onboarding/interview')
    }

    const handleBack = () => {
        router.push('/onboarding/goal')
    }

    return (
        <div className="flex flex-col items-center justify-center w-full mt-12 mb-24">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm mb-4">
                    {t("chattingWithNova")}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">
                    {t("timeTitle")}
                </h1>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4 md:px-0">
                {times.map((t, i) => {
                    const isSelected = timeCommitment === t.id
                    const Icon = t.icon

                    return (
                        <motion.button
                            key={t.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTimeCommitment(t.id)}
                            className={`relative p-6 rounded-2xl border text-left flex flex-col items-start gap-3 transition-all duration-300 overflow-hidden ${isSelected
                                ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <div className={`absolute top-4 right-4 transition-transform duration-300 ${isSelected ? "scale-100" : "scale-0"}`}>
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                </div>
                            </div>

                            <div className={`p-3 rounded-xl bg-gradient-to-br ${t.color}`}>
                                <Icon className={`w-6 h-6 ${t.text}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-heading text-white">{t.title}</h3>
                                <p className="text-sm text-zinc-400">{t.label}</p>
                            </div>
                        </motion.button>
                    )
                })}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 w-full max-w-sm flex items-center gap-4 px-4"
            >
                <button
                    onClick={handleBack}
                    className="px-6 py-6 text-zinc-400 hover:text-white transition-colors"
                >
                    {t("backBtn")}
                </button>
                <GradientButton
                    onClick={handleNext}
                    disabled={!timeCommitment}
                    className="w-full py-6 pr-4 relative group"
                >
                    {t("nextStep")}
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform">→</span>
                </GradientButton>
            </motion.div>
        </div>
    )
}
