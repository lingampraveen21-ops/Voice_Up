"use client";

import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { GradientButton } from "@/components/ui/GradientButton";
import Link from "next/link";

import { useTranslations } from "next-intl";

export function CTASection() {
    const t = useTranslations("CTA");
    return (
        <AuroraBackground showRadialGradient={false} className="py-24 md:py-32 relative border-t border-white/5">
            <div className="container mx-auto px-4 md:px-8 text-center relative z-10 flex flex-col items-center justify-center">
                <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white max-w-3xl leading-tight">
                    {t("heading")}
                </h2>
                <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl">
                    {t("subtext")}
                </p>
                <Link href="/signup">
                    <GradientButton className="text-xl px-10 py-8 font-bold shadow-[0_0_40px_rgba(108,99,255,0.4)]">
                        {t("button")}
                    </GradientButton>
                </Link>
                <p className="mt-8 text-sm text-muted-foreground">
                    {t("socialProof")}
                </p>
            </div>
        </AuroraBackground>
    );
}
