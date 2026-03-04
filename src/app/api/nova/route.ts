import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export async function POST(req: Request) {
    try {
        const { userMessage, conversationHistory, topic, userLevel } = await req.json()

        if (!userMessage) {
            return NextResponse.json({ error: "userMessage is required" }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API Key is missing. Check .env" }, { status: 500 })
        }

        // Initialize the official Gemini SDK
        const ai = new GoogleGenAI({ apiKey: apiKey })

        // Build the system prompt enforcing NOVA's behavioral guidelines
        const systemInstruction = `
    You are NOVA, VoiceUp's warm, patient AI English tutor.
    User level: ${userLevel || 'Beginner'}. Topic: ${topic || 'Casual Conversation'}.
    
    Your behavior:
    1. If user speaks non-English → respond in their language asking them to try in English. Be kind, never frustrated.
    2. If a grammar mistake is detected → gently echo the correct version in 'novaResponse'. Say: "Almost! We say '[correct version]'. Can you try that?" Never say WRONG.
    3. If answer is correct → celebrate warmly. Move forward.
    4. If confused → re-explain with a simpler analogy.
    5. Always end with a clear question to keep them talking.
    6. Keep responses under 3 sentences. Be conversational.
    7. Track mistakes and reference them: "Earlier you said X..."

    You MUST return your response as a JSON object adhering to the schema provided.
    `

        // Define the schema Gemini must return
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
                correction: {
                    type: Type.OBJECT,
                    description: "If grammarMistake is true, provide the exact correction here. If false, return null.",
                    nullable: true,
                    properties: {
                        original: { type: Type.STRING, description: "The exact substring of what the user got wrong." },
                        corrected: { type: Type.STRING, description: "How to say it correctly." },
                        explanation: { type: Type.STRING, description: "A very brief 1-sentence note on why it's wrong." }
                    }
                },
                score: {
                    type: Type.INTEGER,
                    description: "Score the user's input from 0 to 100 based on clarity and correctness. Usually 100 if perfect, maybe 85 if slight errors."
                }
            },
            required: ["novaResponse", "grammarMistake", "score"]
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
                responseSchema: responseSchema,
                temperature: 0.7, // Warm but deterministic
            }
        })

        const responseText = response.text
        if (!responseText) {
            throw new Error("Model returned empty text.")
        }

        const parsedResponse = JSON.parse(responseText)

        return NextResponse.json(parsedResponse)

    } catch (error) {
        console.error("NOVA API Route Error:", error)
        return NextResponse.json({
            error: "Failed to process chat",
            details: error instanceof Error ? error.message : "Server Error"
        }, { status: 500 })
    }
}
