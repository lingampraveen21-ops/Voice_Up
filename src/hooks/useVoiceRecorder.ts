"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNovaStore } from '@/store/useNovaStore'
import { toast } from 'sonner'

// Declare types for the Web Speech API properties Window can possess
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        SpeechRecognition: any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        webkitSpeechRecognition: any
    }
}

export const useVoiceRecorder = () => {
    const { setListening, setTranscript } = useNovaStore()
    const [error, setError] = useState<string | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)
    const [isSupported, setIsSupported] = useState(true)

    useEffect(() => {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setIsSupported(false)
            setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.")
            return
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognitionConstructor = (window.SpeechRecognition || window.webkitSpeechRecognition) as any
            const recognition = new SpeechRecognitionConstructor()
            recognition.continuous = false
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onstart = () => {
                setListening(true)
                setError(null)
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                let interimTranscript = ''
                let finalTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    } else {
                        interimTranscript += event.results[i][0].transcript
                    }
                }

                // Pass the interim transcript to visually show typing effect on UI
                setTranscript(finalTranscript || interimTranscript)
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                if (event.error !== 'no-speech') {
                    setError(`Microphone error: ${event.error}`)
                    toast.error(`Recording error: ${event.error}`)
                }
                setListening(false)
            }

            recognition.onend = () => {
                setListening(false)
            }

            recognitionRef.current = recognition
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setIsSupported(false)
            setError(err.message || "Failed to initialize microphone")
        }
    }, [setListening, setTranscript])

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                setTranscript('')
                recognitionRef.current.start()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                // Handle DOMException if already started
                if (err.name === 'InvalidStateError') {
                    console.warn('Speech recognition already started.')
                } else {
                    toast.error(err.message)
                }
            }
        } else if (!isSupported) {
            toast.error("Speech recognition is not supported in this browser.")
        }
    }, [setTranscript, isSupported])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
    }, [])

    return {
        isSupported,
        startListening,
        stopListening,
        error
    }
}
