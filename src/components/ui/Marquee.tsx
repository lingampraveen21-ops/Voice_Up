"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, ReactNode } from "react";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    reverse?: boolean;
    speed?: "fast" | "normal" | "slow";
}

export function Marquee({
    className,
    direction = "left",
    pauseOnHover = true,
    reverse = false,
    speed = "normal",
    children,
    ...props
}: MarqueeProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollerRef = React.useRef<HTMLUListElement>(null);

    useEffect(() => {
        addAnimation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [start, setStart] = useState(false);

    function addAnimation() {
        if (containerRef.current && scrollerRef.current) {
            const scrollerContent = Array.from(scrollerRef.current.children);

            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                if (scrollerRef.current) {
                    scrollerRef.current.appendChild(duplicatedItem);
                }
            });

            getDirection();
            getSpeed();
            setStart(true);
        }
    }

    const getDirection = () => {
        if (containerRef.current) {
            if (direction === "left") {
                containerRef.current.style.setProperty("--animation-direction", reverse ? "reverse" : "forwards");
            } else {
                containerRef.current.style.setProperty("--animation-direction", reverse ? "forwards" : "reverse");
            }
        }
    };

    const getSpeed = () => {
        if (containerRef.current) {
            if (speed === "fast") {
                containerRef.current.style.setProperty("--animation-duration", "20s");
            } else if (speed === "normal") {
                containerRef.current.style.setProperty("--animation-duration", "40s");
            } else {
                containerRef.current.style.setProperty("--animation-duration", "80s");
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
                className
            )}
            {...props}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
                    start && "animate-marquee",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
            >
                {children}
            </ul>
        </div>
    );
}
