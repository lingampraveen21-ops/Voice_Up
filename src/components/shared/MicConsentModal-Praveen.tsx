"use client";

import { motion } from "framer-motion";
import { Mic, ShieldCheck, X } from "lucide-react";
import { GradientButton } from "../ui/GradientButton";
import { GhostButton } from "../ui/GhostButton";

interface MicConsentModalProps {
    onAllow: () => void;
    onCancel: () => void;
}

export function MicConsentModal({ onAllow, onCancel }: MicConsentModalProps) {

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onCancel}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#0f0f1a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <Mic className="w-8 h-8 text-primary" />
                    </div>

                    <h2 className="text-2xl font-bold font-heading text-white mb-4">
                        Microphone Usage & Privacy
                    </h2>

                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        VoiceUp needs your microphone to practice speaking.
                        Your voice is processed in real-time by AI and <strong>never stored permanently</strong> on our servers.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <ShieldCheck className="w-5 h-5 text-success" />
                            <span className="text-xs text-zinc-300 font-medium whitespace-nowrap">Secure Processing</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <X className="w-5 h-5 text-error" />
                            <span className="text-xs text-zinc-300 font-medium whitespace-nowrap">No Permanent Storage</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full mt-8">
                        <GradientButton onClick={onAllow} className="w-full h-12">
                            I Understand, Allow Mic
                        </GradientButton>
                        <GhostButton onClick={onCancel} className="w-full text-zinc-400 hover:text-white">
                            Not Now
                        </GhostButton>
                    </div>

                    <p className="text-[10px] text-zinc-600 mt-6 uppercase tracking-widest font-bold">
                        Privacy First Architecture
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
