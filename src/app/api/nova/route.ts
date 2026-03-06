import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

// --- In-memory rate limiter (per-instance, serverless-safe) ---
const RATE_LIMIT_MS = 3000
const rateLimitMap = new Map<string, number>()

// Periodically prune stale entries to prevent unbounded growth
const PRUNE_INTERVAL_MS = 60_000
let lastPrune = Date.now()
function pruneRateLimitMap() {
    const now = Date.now()
    if (now - lastPrune < PRUNE_INTERVAL_MS) return
    lastPrune = now
    rateLimitMap.forEach((timestamp, key) => {
        if (now - timestamp > RATE_LIMIT_MS * 2) rateLimitMap.delete(key)
    })
}

// --- Request dedup: prevent duplicate Gemini calls for the same request ---
const inflightRequests = new Set<string>()

// --- Retry helper with exponential backoff ---
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            const is429 = message.includes('429') || message.toLowerCase().includes('resource exhausted')
            if (is429 && attempt < maxRetries) {
                const delayMs = 1000 * Math.pow(2, attempt) // 1s, 2s
                console.warn(`[NOVA] Gemini 429 — retry ${attempt + 1}/${maxRetries} after ${delayMs}ms`)
                await new Promise(r => setTimeout(r, delayMs))
                continue
            }
            throw err
        }
    }
    throw new Error('Unreachable')
}

export async function POST(req: Request) {
    let dedupKey = ''
    try {
        const { userMessage, conversationHistory, topic, userLevel, locale = 'en' } = await req.json()

        if (!userMessage) {
            return NextResponse.json({ error: "userMessage is required" }, { status: 400 })
        }

        // --- Rate limiting ---
        pruneRateLimitMap()
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
        const lastRequest = rateLimitMap.get(clientIp) || 0
        const elapsed = Date.now() - lastRequest
        if (elapsed < RATE_LIMIT_MS) {
            console.warn(`[NOVA] Rate limited IP ${clientIp} — ${elapsed}ms since last call`)
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment.' },
                { status: 429 }
            )
        }
        rateLimitMap.set(clientIp, Date.now())

        // --- Dedup guard: reject if identical request is already in-flight ---
        dedupKey = `${clientIp}:${userMessage.trim().slice(0, 100)}`
        if (inflightRequests.has(dedupKey)) {
            console.warn(`[NOVA] Duplicate in-flight request blocked: ${dedupKey}`)
            return NextResponse.json(
                { error: 'Duplicate request — still processing your previous message.' },
                { status: 429 }
            )
        }
        inflightRequests.add(dedupKey)

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            inflightRequests.delete(dedupKey)
            return NextResponse.json({ error: "Gemini API Key is missing. Check .env.local" }, { status: 500 })
        }

        const genAI = new GoogleGenerativeAI(apiKey)

        // Language specific context
        const localeNames: Record<string, string> = {
            en: 'English',
            hi: 'Hindi',
            es: 'Spanish',
            fr: 'French',
            pt: 'Portuguese'
        }

        // Build the system prompt enforcing NOVA's behavioral guidelines
        const systemInstruction = `
    You are NOVA, VoiceUp's warm, patient AI English tutor.
    User level: ${userLevel || 'Beginner'}. Topic: ${topic || 'Casual Conversation'}.
    User's interface language: ${localeNames[locale] || 'English'}.
    
    Your behavior:
    1. If user speaks non-English → respond in their interface language (${localeNames[locale] || 'English'}) asking them to try in English. Be kind, never frustrated.
    2. If the user is struggling, you can provide brief explanations or translations in their language (${localeNames[locale] || 'English'}), but always encourage English practice.
    3. If a grammar mistake is detected → gently echo the correct version in 'novaResponse'. Say: "Almost! We say '[correct version]'. Can you try that?" Never say WRONG.
    4. If answer is correct → celebrate warmly. Move forward.
    5. Always end with a clear question to keep them talking.
    6. Keep responses under 3 sentences. Be conversational.
    7. Track mistakes and reference them: "Earlier you said X..."
 
    You MUST return your response as a JSON object adhering to the schema provided.
    If there is a grammar mistake, set grammarMistake to true and populate correctionOriginal, correctionCorrected, correctionExplanation.
    If there is no grammar mistake, set grammarMistake to false and leave correctionOriginal, correctionCorrected, correctionExplanation as empty strings.
    `

        const responseSchema: ResponseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                novaResponse: {
                    type: SchemaType.STRING,
                    description: "NOVA's conversational reply to the user. Keep it under 3 sentences."
                },
                grammarMistake: {
                    type: SchemaType.BOOLEAN,
                    description: "True if the user made a noticeable grammar or syntax error, false otherwise."
                },
                correctionOriginal: {
                    type: SchemaType.STRING,
                    description: "If grammarMistake is true, the exact substring the user got wrong. Otherwise empty string."
                },
                correctionCorrected: {
                    type: SchemaType.STRING,
                    description: "If grammarMistake is true, the correct version. Otherwise empty string."
                },
                correctionExplanation: {
                    type: SchemaType.STRING,
                    description: "If grammarMistake is true, a brief 1-sentence explanation of why it is wrong. Otherwise empty string."
                },
                score: {
                    type: SchemaType.INTEGER,
                    description: "Score the user's input from 0 to 100 based on clarity and correctness. Usually 100 if perfect, 85 if minor errors."
                }
            },
            required: ["novaResponse", "grammarMistake", "correctionOriginal", "correctionCorrected", "correctionExplanation", "score"]
        }

        // Format previous history for Gemini
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedHistory = conversationHistory?.map((msg: any) => ({
            role: msg.role === 'nova' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        })) || []

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            systemInstruction,
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.7,
            }
        })

        const result = await callWithRetry(() =>
            model.generateContent({
                contents: [
                    ...formattedHistory,
                    { role: 'user', parts: [{ text: userMessage }] }
                ]
            })
        )

        const responseText = result.response.text()
        if (!responseText || responseText === '{}') {
            throw new Error("Model returned empty response.")
        }

        let flat
        try {
            flat = JSON.parse(responseText)
        } catch {
            console.error("Failed to parse Gemini response:", responseText)
            throw new Error("Gemini returned invalid JSON")
        }

        inflightRequests.delete(dedupKey)

        // Return flat fields directly — frontend reads correctionOriginal etc.
        return NextResponse.json({
            novaResponse: flat.novaResponse || "I'm sorry, I didn't catch that. Could you try again?",
            grammarMistake: flat.grammarMistake || false,
            correctionOriginal: flat.correctionOriginal || '',
            correctionCorrected: flat.correctionCorrected || '',
            correctionExplanation: flat.correctionExplanation || '',
            score: flat.score ?? 85,
        })

    } catch (error) {
        if (dedupKey) inflightRequests.delete(dedupKey)

        const message = error instanceof Error ? error.message : String(error)
        const is429 = message.includes('429') || message.toLowerCase().includes('resource exhausted')

        if (is429) {
            console.warn('[NOVA] Gemini quota exhausted after retries')
            return NextResponse.json(
                { error: 'AI service is temporarily busy. Please try again in a moment.' },
                { status: 429 }
            )
        }

        console.error('NOVA API Route Error:', message)
        return NextResponse.json({
            error: 'Gemini API failed',
            details: message || 'Unknown server error'
        }, { status: 500 })
    }
}
