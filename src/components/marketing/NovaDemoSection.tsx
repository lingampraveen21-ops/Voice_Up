"use client";

import { NovaAvatar } from "@/components/ui/NovaAvatar";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

import { useTranslations } from "next-intl";

export function NovaDemoSection() {
    const t = useTranslations("NovaDemo");
    const [stepIndex, setStepIndex] = useState(0);

    const DEMO_SEQUENCE = useMemo(() => [
        { type: "user", text: t("userMsg1"), delay: 1000 },
        { type: "nova", text: t("novaMsg1"), delay: 2500 },
        { type: "clear", delay: 5000 },
        { type: "user", text: t("userMsg2"), delay: 1000 },
        { type: "nova", text: t("novaMsg2"), delay: 2500 },
        { type: "clear", delay: 5000 },
    ], [t]);

    useEffect(() => {
        const currentStep = DEMO_SEQUENCE[stepIndex];
        const timer = setTimeout(() => {
            setStepIndex((prev) => (prev + 1) % DEMO_SEQUENCE.length);
        }, currentStep.delay);
        return () => clearTimeout(timer);
    }, [stepIndex, DEMO_SEQUENCE]);

    const isUserVisible = stepIndex === 0 || stepIndex === 1 || stepIndex === 3 || stepIndex === 4;
    const isNovaVisible = stepIndex === 1 || stepIndex === 4;

    const currentMessage = isUserVisible
        ? (stepIndex < 2 ? DEMO_SEQUENCE[0].text : DEMO_SEQUENCE[3].text)
        : "";

    const novaMessage = isNovaVisible
        ? (stepIndex < 2 ? DEMO_SEQUENCE[1].text : DEMO_SEQUENCE[4].text)
        : "";

    return (
        <section className="py-24 relative overflow-hidden bg-surface/50 border-y border-white/5">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">{t("title")}</h2>
                    <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
                </div>

                <div className="relative max-w-2xl mx-auto h-[400px] flex items-center justify-center">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                    {/* Central NOVA Avatar */}
                    <div className="relative z-10 flex flex-col items-center">
                        <NovaAvatar className="h-32 w-32 md:h-40 md:w-40 text-5xl mb-8 border-4 border-surface shadow-[0_0_40px_rgba(255,101,132,0.4)]" />
                    </div>

                    {/* User Chat Bubble */}
                    <AnimatePresence>
                        {isUserVisible && (
                            <motion.div
                                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="absolute top-[20%] left-0 md:left-[10%] bg-surface-raised border border-white/10 px-6 py-4 rounded-2xl rounded-br-sm shadow-xl z-20 max-w-[280px]"
                            >
                                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">You</div>
                                <div className="text-white text-lg">{currentMessage}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* NOVA Chat Bubble */}
                    <AnimatePresence>
                        {isNovaVisible && (
                            <motion.div
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="absolute bottom-[20%] right-0 md:right-[10%] bg-gradient-to-r from-secondary/20 to-primary/20 backdrop-blur-md border border-secondary/30 px-6 py-4 rounded-2xl rounded-bl-sm shadow-[0_10px_40px_rgba(255,101,132,0.2)] z-20 max-w-[300px]"
                            >
                                <div className="text-xs text-secondary mb-1 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                                    </span>
                                    NOVA
                                </div>
                                <div className="text-white text-lg">{novaMessage}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
