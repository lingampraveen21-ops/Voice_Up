"use client";

import { Canvas } from "@react-three/fiber";
import { WireframeSphere } from "@/components/3d/WireframeSphere";
import { NovaAvatar } from "@/components/ui/NovaAvatar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function HeroRightSide() {
    const [displayText, setDisplayText] = useState("");
    const fullText = "Ready to practice? 😊";

    useEffect(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < fullText.length) {
                setDisplayText(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <div className="relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] w-full flex items-center justify-center pointer-events-none">
            {/* 3D Sphere Background */}
            <div className="absolute inset-0">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} color="#ff6584" />
                    <WireframeSphere />
                </Canvas>
            </div>

            {/* Parallax Content */}
            <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.1}
                className="relative z-10 flex flex-col items-center pointer-events-auto"
            >
                <div className="relative">
                    {/* NOVA Avatar with Halo */}
                    <div className="absolute -inset-4 rounded-full bg-secondary/30 blur-xl animate-pulse" />
                    <NovaAvatar className="h-24 w-24 text-3xl z-10 relative" />

                    {/* Typing Speech Bubble */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: -10, y: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 16, y: -16 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="absolute top-4 left-full z-20 origin-bottom-left"
                    >
                        <div className="glass px-5 py-3 rounded-2xl rounded-bl-sm whitespace-nowrap text-white font-medium shadow-2xl border border-white/10">
                            {displayText}
                            <span className="animate-pulse ml-1 opacity-50">|</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
