"use client"

import { motion } from 'framer-motion'
import { MicOff, Settings, AlertCircle } from 'lucide-react'

interface MicStatusProps {
    status: 'denied' | 'prompt' | 'granted'
    onRetry: () => void
}

export function MicStatus({ status, onRetry }: MicStatusProps) {
    if (status === 'granted') return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center max-w-sm"
        >
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-500/20">
                <MicOff className="w-6 h-6 text-red-500" />
            </div>
            <h4 className="text-white font-bold mb-2">Microphone Access Denied</h4>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                VoiceUp needs your microphone to work. Please click the <Settings className="w-3 h-3 inline" /> icon in your browser address bar and allow microphone access.
            </p>

            <button
                onClick={onRetry}
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all"
            >
                <AlertCircle className="w-4 h-4" /> Try Again
            </button>
        </motion.div>
    )
}
