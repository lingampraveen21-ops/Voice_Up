"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { TiltCard } from "@/components/ui/TiltCard";
import { Bot, Mic, Star, Trophy, Map, BadgeCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesBentoSection() {
    const t = useTranslations("Features");
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        gsap.from(".bento-card", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
            },
            scale: 0.9,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
        });
    }, { scope: containerRef });

    return (
        <section id="features" className="py-24 relative" ref={containerRef}>
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">{t("title")}</h2>
                    <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">

                    {/* Large Card: NOVA AI Tutor (Span 2 cols, 2 rows) */}
                    <TiltCard className="bento-card md:col-span-2 md:row-span-2 group/nova relative bg-gradient-to-br from-surface to-primary/10">
                        <div className="absolute top-8 right-8 h-24 w-24 rounded-full bg-secondary/20 blur-2xl group-hover/nova:bg-secondary/40 transition-colors duration-500" />
                        <Bot className="h-12 w-12 text-secondary mb-8" />
                        <h3 className="text-3xl font-bold font-heading mb-4 text-white">{t("novaTitle")}</h3>
                        <p className="text-lg text-muted-foreground">{t("novaDesc")}</p>
                    </TiltCard>

                    {/* Medium Card: Voice-First */}
                    <TiltCard className="bento-card md:col-span-1 lg:col-span-2 relative overflow-hidden bg-gradient-to-bl from-surface to-surface-raised">
                        <Mic className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold font-heading mb-2 text-white">{t("voiceTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("voiceDesc")}</p>
                    </TiltCard>

                    {/* Medium Card: Real Scoring */}
                    <TiltCard className="bento-card md:col-span-1 lg:col-span-1 border-success/20">
                        <Star className="h-10 w-10 text-success mb-4" />
                        <h3 className="text-xl font-bold font-heading mb-2 text-white">{t("scoringTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("scoringDesc")}</p>
                    </TiltCard>

                    {/* Small Card: Challenges */}
                    <TiltCard className="bento-card col-span-1">
                        <Trophy className="h-8 w-8 text-warning mb-4" />
                        <h3 className="text-lg font-bold font-heading mb-2 text-white">{t("challengesTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("challengesDesc")}</p>
                    </TiltCard>

                    {/* Small Card: Roadmap */}
                    <TiltCard className="bento-card col-span-1 border-primary/20">
                        <Map className="h-8 w-8 text-primary mb-4" />
                        <h3 className="text-lg font-bold font-heading mb-2 text-white">{t("roadmapTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("roadmapDesc")}</p>
                    </TiltCard>

                    {/* Medium Card: Certificates */}
                    <TiltCard className="bento-card md:col-span-2 lg:col-span-2 bg-gradient-to-tr from-surface to-success/10">
                        <div className="flex justify-between items-start w-full pr-4">
                            <div className="flex flex-col">
                                <BadgeCheck className="h-10 w-10 text-success mb-4" />
                                <h3 className="text-xl font-bold font-heading mb-2 text-white">{t("certificatesTitle")}</h3>
                                <p className="text-sm text-muted-foreground max-w-[200px]">{t("certificatesDesc")}</p>
                            </div>
                            {/* Decorative element */}
                            <div className="h-24 w-24 rounded-full border-4 border-success/20 flex items-center justify-center -mr-8 -mt-8 opacity-50">
                                <div className="h-16 w-16 rounded-full border-2 border-success/40" />
                            </div>
                        </div>
                    </TiltCard>

                </div>
            </div>
        </section>
    );
}
