"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { AnimatedBadge } from "@/components/ui/AnimatedBadge";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { GradientButton } from "@/components/ui/GradientButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { AnimatedHeading } from "@/components/hero/AnimatedHeading";
import { HeroParticles } from "@/components/hero/HeroParticles";
import dynamic from "next/dynamic";

const HeroRightSide = dynamic(() => import("@/components/hero/HeroRightSide").then((mod) => mod.HeroRightSide), {
    ssr: false,
});
import { Play } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function HeroSection() {
    const t = useTranslations("Hero");
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        gsap.from(".hero-subtext", {
            opacity: 0,
            y: 20,
            duration: 1,
            delay: 1.2, // After heading
            ease: "power2.out"
        });

        gsap.from(".hero-buttons", {
            opacity: 0,
            y: 20,
            duration: 0.8,
            delay: 1.6,
            ease: "power2.out"
        });

    }, { scope: containerRef });

    return (
        <AuroraBackground className="min-h-screen relative overflow-hidden" showRadialGradient>
            <HeroParticles />

            <div className="container mx-auto px-4 md:px-8 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Left Side: Content */}
                <div ref={containerRef} className="flex flex-col gap-8 items-start">
                    <AnimatedBadge text={t("badge")} />

                    <AnimatedHeading text={t("heading")} />

                    <div className="hero-buttons flex flex-wrap items-center gap-3 sm:gap-4 mt-4">
                        <GradientButton className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 min-h-[44px]">
                            {t("startFree")}
                        </GradientButton>
                        <GhostButton className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 gap-2 min-h-[44px]">
                            <Play className="h-5 w-5 fill-current" />
                            {t("watchDemo")}
                        </GhostButton>
                    </div>

                    {/* Social Proof Row */}
                    <div className="hero-subtext flex items-center gap-4 mt-8 pt-8 border-t border-white/10 w-full max-w-sm">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-surface bg-muted overflow-hidden flex items-center justify-center relative">
                                    <Image src={`https://i.pravatar.cc/150?img=${i + 10}`} fill alt="User" sizes="40px" className="object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex text-warning text-sm">
                                {"★★★★★"}
                            </div>
                            <span className="text-sm text-white/80 font-medium">{t("socialProof")}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: 3D Sphere & Demo */}
                <HeroRightSide />
            </div>
        </AuroraBackground>
    );
}
