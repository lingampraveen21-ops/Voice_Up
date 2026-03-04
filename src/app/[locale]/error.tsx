"use client"

import { useEffect } from 'react'
import { ErrorState } from '@/components/shared/ErrorState'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center">
            <ErrorState
                title="Application Error"
                message="A client-side error occurred. Don't worry, NOVA is safe! Try resetting the page or go back home."
                onRetry={reset}
            />
        </div>
    )
}
