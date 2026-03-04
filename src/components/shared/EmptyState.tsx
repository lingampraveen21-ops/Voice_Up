"use client"

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    className?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center text-center p-6", className)}>
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                <Icon className="w-6 h-6 text-zinc-500" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
            <p className="text-xs text-zinc-500 max-w-[200px] mb-4">{description}</p>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="text-xs font-bold text-primary hover:underline transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}
