"use client"

import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect } from 'react'
import { Sparkles } from 'lucide-react'

export type NovaState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'correcting'

interface RiveNovaAvatarProps {
    currentState?: NovaState
    className?: string
}

export const RiveNovaAvatar = ({ currentState = 'idle', className = "w-32 h-32" }: RiveNovaAvatarProps) => {
    // Load the Rive file from /public/nova.riv
    // We assume the state machine is named "State Machine 1" (the most common default)
    const { rive, RiveComponent } = useRive({
        src: '/nova.riv',
        stateMachines: 'State Machine 1',
        autoplay: true,
    })

    // Try to get a standard Number input named "state"
    // 0=idle, 1=listening, 2=thinking, 3=speaking, 4=happy, 5=correcting
    const stateInput = useStateMachineInput(rive, 'State Machine 1', 'state', 0)

    // Also try boolean triggers as a fallback in case the user's downloaded file uses those
    const isSpeaking = useStateMachineInput(rive, 'State Machine 1', 'isSpeaking')
    const isListening = useStateMachineInput(rive, 'State Machine 1', 'isListening')
    const isThinking = useStateMachineInput(rive, 'State Machine 1', 'isThinking')
    const isHappy = useStateMachineInput(rive, 'State Machine 1', 'isHappy')

    useEffect(() => {
        if (!rive) return

        let numericState = 0
        switch (currentState) {
            case 'idle': numericState = 0; break;
            case 'listening': numericState = 1; break;
            case 'thinking': numericState = 2; break;
            case 'speaking': numericState = 3; break;
            case 'happy': numericState = 4; break;
            case 'correcting': numericState = 5; break;
        }

        // Apply number state
        if (stateInput) stateInput.value = numericState

        // Apply boolean fallbacks
        if (isSpeaking) isSpeaking.value = (currentState === 'speaking' || currentState === 'correcting')
        if (isListening) isListening.value = (currentState === 'listening')
        if (isThinking) isThinking.value = (currentState === 'thinking')
        if (isHappy) isHappy.value = (currentState === 'happy')

    }, [currentState, rive, stateInput, isSpeaking, isListening, isThinking, isHappy])

    return (
        <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
            <RiveComponent className="w-full h-full z-10" />

            {/* Fallback skeleton if the Rive file hasn't loaded or is missing */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 border-2 border-primary/30 shadow-[0_0_20px_rgba(168,85,247,0.2)] -z-10 animate-pulse">
                <div className="w-1/2 h-1/2 rounded-full bg-primary/40 blur-md" />
                <Sparkles className="absolute w-6 h-6 text-white/50 animate-bounce" />
            </div>

            {/* Colored glows based on state */}
            {currentState === 'listening' && <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />}
            {currentState === 'speaking' && <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />}
            {currentState === 'thinking' && <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />}
            {currentState === 'correcting' && <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />}
        </div>
    )
}
