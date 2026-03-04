"use client"

import { useState, useCallback, useEffect } from 'react'
import { useNovaStore } from '@/store/useNovaStore'

export const useSpeechSynthesis = () => {
    const { setSpeaking } = useNovaStore()
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices()
            setVoices(availableVoices)
        }

        // Chrome explicitly needs this event
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices
            loadVoices() // Initial load
        }
    }, [])

    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)

        // Attempt to find a warm, clear English voice (prioritize specific ones if available)
        let selectedVoice = voices.find(v => v.lang.includes('en-IN') && v.name.includes('Female'))
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Female')))
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('en-'))

        if (selectedVoice) {
            utterance.voice = selectedVoice
        }

        // Fine-tune tone
        utterance.rate = 0.95 // Slightly slower for clarity
        utterance.pitch = 1.1 // Slightly higher pitch for warmth

        utterance.onstart = () => {
            setSpeaking(true)
        }

        utterance.onend = () => {
            setSpeaking(false)
        }

        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e)
            setSpeaking(false)
        }

        window.speechSynthesis.speak(utterance)
    }, [voices, setSpeaking])

    const stop = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel()
            setSpeaking(false)
        }
    }, [setSpeaking])

    return {
        speak,
        stop
    }
}
