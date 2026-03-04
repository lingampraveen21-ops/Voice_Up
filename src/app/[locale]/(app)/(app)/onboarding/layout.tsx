"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { RiveNovaAvatar } from "@/components/ui/RiveNovaAvatar"

import { useTranslations } from "next-intl"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("Onboarding")
    const pathname = usePathname()

    // Calculate which step we are on
    let currentStep = 1
    if (pathname.includes('/onboarding/time')) currentStep = 2
    if (pathname.includes('/onboarding/interview')) currentStep = 3

    return (
        <div className="min-h-screen bg-[#080810] text-white flex flex-col items-center py-12 px-4 relative overflow-hidden">
            {/* Background ambient light */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />

            {/* NOVA Avatar placeholder (Top Center) */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-8 z-10"
            >
                <RiveNovaAvatar currentState="happy" className="w-16 h-16 shrink-0 z-10" />
            </motion.div>

            {/* Dynamic Content Wrapper */}
            <div className="w-full max-w-xl z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Dots Bottom */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
                <div className="flex gap-2">
                    {[1, 2, 3].map((step) => (
                        <motion.div
                            key={step}
                            layout
                            className={`h-2 rounded-full transition-all duration-300 ${step === currentStep
                                ? "w-8 bg-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                : "w-2 bg-white/20"
                                }`}
                        />
                    ))}
                </div>
                <span className="text-xs text-zinc-500 font-mono">{t("stepIndicator", { current: currentStep, total: 3 })}</span>
            </div>
        </div>
    )
}
