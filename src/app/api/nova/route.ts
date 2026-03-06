import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { userMessage, conversationHistory, topic, userLevel, locale = 'en' } = await req.json()

        if (!userMessage) {
            return NextResponse.json({ error: "userMessage is required" }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API Key is missing. Check .env.local" }, { status: 500 })
        }

        // Initialize the official Gemini SDK
        const ai = new GoogleGenAI({ apiKey })

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

        // Define the schema Gemini must return.
        // NOTE: Gemini structured output does not support nullable OBJECT types reliably.
        // We flatten the correction object into top-level string fields instead.
        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                novaResponse: {
                    type: Type.STRING,
                    description: "NOVA's conversational reply to the user. Keep it under 3 sentences."
                },
                grammarMistake: {
                    type: Type.BOOLEAN,
                    description: "True if the user made a noticeable grammar or syntax error, false otherwise."
                },
                correctionOriginal: {
                    type: Type.STRING,
                    description: "If grammarMistake is true, the exact substring the user got wrong. Otherwise empty string."
                },
                correctionCorrected: {
                    type: Type.STRING,
                    description: "If grammarMistake is true, the correct version. Otherwise empty string."
                },
                correctionExplanation: {
                    type: Type.STRING,
                    description: "If grammarMistake is true, a brief 1-sentence explanation of why it is wrong. Otherwise empty string."
                },
                score: {
                    type: Type.INTEGER,
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

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                ...formattedHistory,
                { role: 'user', parts: [{ text: userMessage }] }
            ],
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.7,
            }
        })

        const responseText = response.text ?? '{}'
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
        console.error("NOVA API Route Error:", error instanceof Error ? error.message : error)
        return NextResponse.json({
            error: "Gemini API failed",
            details: error instanceof Error ? error.message : "Unknown server error"
        }, { status: 500 })
    }
}
