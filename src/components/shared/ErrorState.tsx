"use client"

import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorStateProps {
    title?: string
    message?: string
    onRetry?: () => void
}

export function ErrorState({
    title = "Something went wrong",
    message = "NOVA encountered an unexpected issue. Please try again or head back to the dashboard.",
    onRetry
}: ErrorStateProps) {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-[#080810] min-h-[400px]">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20"
            >
                <AlertCircle className="w-10 h-10 text-red-500" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2 font-heading">{title}</h2>
            <p className="text-zinc-400 max-w-md mb-8 leading-relaxed">{message}</p>

            <div className="flex flex-col sm:flex-row gap-4">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                )}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                >
                    <Home className="w-4 h-4" /> Back to Dashboard
                </button>
            </div>
        </div>
    )
}
