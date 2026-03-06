"use client"

import { useCallback, useEffect, useRef } from 'react'
import { useNovaStore } from '@/store/useNovaStore'

export const useSpeechSynthesis = () => {
    const { setSpeaking } = useNovaStore()
    const voicesReady = useRef(false)
    const onEndCallback = useRef<(() => void) | null>(null)
    const speakTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return

        const markReady = () => { voicesReady.current = true }

        if (window.speechSynthesis.getVoices().length > 0) {
            voicesReady.current = true
        } else {
            window.speechSynthesis.onvoiceschanged = markReady
        }

        // Cleanup on unmount
        return () => {
            window.speechSynthesis.cancel()
            if (speakTimeout.current) clearTimeout(speakTimeout.current)
        }
    }, [])

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.error("SpeechSynthesis not supported in this browser")
            onEnd?.()
            return
        }

        try {
            // Cancel any ongoing speech + pending timeout
            window.speechSynthesis.cancel()
            if (speakTimeout.current) clearTimeout(speakTimeout.current)

            onEndCallback.current = onEnd || null

            const utterance = new SpeechSynthesisUtterance(text)

            // Read voices LIVE (not from stale state)
            const voices = window.speechSynthesis.getVoices()
            let selectedVoice = voices.find(v => v.lang.includes('en-IN') && v.name.includes('Female'))
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Female')))
            if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('en-'))

            if (selectedVoice) {
                utterance.voice = selectedVoice
            }

            utterance.rate = 0.95
            utterance.pitch = 1.1

            utterance.onstart = () => {
                setSpeaking(true)
            }

            utterance.onend = () => {
                setSpeaking(false)
                onEndCallback.current?.()
                onEndCallback.current = null
            }

            utterance.onerror = (e) => {
                console.error(`Speech synthesis error [${e.error}]:`, e.error === 'canceled' ? 'Speech was canceled' : e.error)
                setSpeaking(false)
                // Don't fire callback on 'canceled' — it was intentional
                if (e.error !== 'canceled') {
                    onEndCallback.current?.()
                }
                onEndCallback.current = null
            }

            // Small delay fixes Chrome bug where speak() silently fails after cancel()
            speakTimeout.current = setTimeout(() => {
                window.speechSynthesis.speak(utterance)
            }, 100)
        } catch (err) {
            console.error("SpeechSynthesis unexpected error:", err)
            setSpeaking(false)
            onEndCallback.current?.()
            onEndCallback.current = null
        }
    }, [setSpeaking])

    const stop = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel()
            if (speakTimeout.current) clearTimeout(speakTimeout.current)
            setSpeaking(false)
            onEndCallback.current = null
        }
    }, [setSpeaking])

    return {
        speak,
        stop,
        voicesReady
    }
}
