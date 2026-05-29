"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export function AnimatedHeading({ text }: { text: string }) {
    const containerRef = useRef<HTMLHeadingElement>(null);

    // Split text into words for animation
    const words = text.split(" ");

    useGSAP(() => {
        if (!containerRef.current) return;

        gsap.from(".hero-word", {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.2
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex flex-col gap-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold font-heading text-white tracking-tight flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-2">
                {words.map((word, i) => (
                    <span key={i} className="hero-word overflow-hidden inline-block clip-path-bottom">
                        <span className="inline-block">{word}</span>
                    </span>
                ))}
            </h1>

            <p className="hero-subtext text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl font-body">
                The only app that makes you speak — not type.
            </p>
        </div>
    );
}
