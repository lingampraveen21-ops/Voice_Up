"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import NumberTicker from "@/components/ui/NumberTicker";

gsap.registerPlugin(ScrollTrigger);

export function StatsBar() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(containerRef.current, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 90%",
            }
        });
    }, { scope: containerRef });

    return (
        <div className="w-full relative z-20 -mt-8 md:-mt-12 px-4 md:px-8">
            <div
                ref={containerRef}
                className="glass max-w-5xl mx-auto rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10"
            >
                <div className="flex flex-col items-center justify-center p-2">
                    <div className="flex items-center text-4xl font-bold font-heading text-primary">
                        <NumberTicker value={500000} />
                        <span className="text-secondary ml-1">+</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">Learners</p>
                </div>

                <div className="flex flex-col items-center justify-center p-2 pt-6 md:pt-2">
                    <div className="flex items-center text-4xl font-bold font-heading text-primary">
                        <NumberTicker value={50} />
                        <span className="text-secondary ml-1">+</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">Countries</p>
                </div>

                <div className="flex flex-col items-center justify-center p-2 pt-6 md:pt-2">
                    <div className="flex items-center text-4xl font-bold font-heading text-primary">
                        <NumberTicker value={125} />
                        <span className="text-secondary ml-1">+</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">Lessons</p>
                </div>

                <div className="flex flex-col items-center justify-center p-2 pt-6 md:pt-2">
                    <div className="flex items-center text-4xl font-bold font-heading text-primary">
                        <span className="mr-1">₹</span>
                        <NumberTicker value={0} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">Cost Forever</p>
                </div>
            </div>
        </div>
    );
}
