"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { MicOff, Mic } from "lucide-react";

import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export function ProblemSolutionSection() {
    const tp = useTranslations("Problem");
    const ts = useTranslations("Solution");
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
                end: "bottom 80%",
                toggleActions: "play none none reverse",
            }
        });

        tl.fromTo(".problem-text",
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
        )
            .fromTo(".solution-text",
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
                "-=0.4"
            );
    }, { scope: containerRef });

    return (
        <section className="py-24 md:py-32 relative overflow-hidden" ref={containerRef}>
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center max-w-6xl mx-auto">

                    {/* Problem */}
                    <div className="problem-text flex flex-col gap-6 text-center md:text-right md:border-r border-white/10 md:pr-12 lg:pr-24">
                        <div className="mx-auto md:ml-auto md:mr-0 h-16 w-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                            <MicOff className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white/50 line-through decoration-error/50 decoration-2">
                            {tp("heading")}
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            {tp("subtext")}
                        </p>
                    </div>

                    {/* Solution */}
                    <div className="solution-text flex flex-col gap-6 text-center md:text-left md:pl-12 lg:pl-24 relative">
                        {/* Soft Glow */}
                        <div className="absolute top-1/2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="mx-auto md:ml-0 md:mr-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 ring-2 ring-primary/50 ring-offset-4 ring-offset-background">
                            <Mic className="h-8 w-8" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary relative z-10">
                            {ts("heading")}
                        </h2>
                        <p className="text-lg text-white/80 relative z-10">
                            {ts("subtext")}
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
