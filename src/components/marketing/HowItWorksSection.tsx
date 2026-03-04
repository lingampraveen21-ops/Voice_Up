"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mic, Bot, TrendingUp } from "lucide-react";
import { useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
    {
        icon: Mic,
        title: "1. Speak",
        description: "Open your mic and talk naturally. No typing allowed.",
        color: "text-primary",
        bg: "bg-primary/20",
    },
    {
        icon: Bot,
        title: "2. NOVA Listens",
        description: "AI corrects your grammar and pronunciation instantly.",
        color: "text-secondary",
        bg: "bg-secondary/20",
    },
    {
        icon: TrendingUp,
        title: "3. You Improve",
        description: "See your fluency scores grow daily on your dashboard.",
        color: "text-success",
        bg: "bg-success/20",
    },
];

export function HowItWorksSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        gsap.from(".step-card", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
        });
    }, { scope: containerRef });

    return (
        <section id="how-it-works" className="py-24 relative" ref={containerRef}>
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">How it Works</h2>
                    <p className="text-lg text-muted-foreground">Three simple steps to fluency. It feels like chatting with a friend who happens to be a perfect English teacher.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Desktop Connecting Line */}
                    <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10" />

                    {STEPS.map((step) => (
                        <GlassCard key={step.title} className="step-card flex flex-col items-center text-center relative group hover:border-white/20 transition-colors">
                            <div className={`h-20 w-20 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300`}>
                                <step.icon className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-bold font-heading mb-4 text-white">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
