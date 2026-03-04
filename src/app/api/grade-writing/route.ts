import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export async function POST(req: Request) {
    try {
        const { userText, taskType, userLevel } = await req.json()
        if (!userText?.trim()) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'API key missing' }, { status: 500 })

        const ai = new GoogleGenAI({ apiKey })

        const systemInstruction = `
    You are an English writing coach grading a student's text.
    Student level: ${userLevel || 'B1'}. Task type: ${taskType || 'General Writing'}.
    
    Grade strictly but constructively. Return JSON exactly matching the schema.
    Scores are 0-100. Identify real mistakes, not nitpicks.
    `

        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                scores: {
                    type: Type.OBJECT,
                    properties: {
                        grammar: { type: Type.INTEGER, description: 'Grammar correctness 0-100' },
                        formality: { type: Type.INTEGER, description: 'Appropriate register/formality 0-100' },
                        structure: { type: Type.INTEGER, description: 'Logical organization 0-100' },
                        tone: { type: Type.INTEGER, description: 'Tone consistency and clarity 0-100' },
                    },
                    required: ['grammar', 'formality', 'structure', 'tone']
                },
                mistakes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            original: { type: Type.STRING },
                            corrected: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        }
                    }
                },
                suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                overallFeedback: { type: Type.STRING, description: 'One encouraging sentence of overall feedback' }
            },
            required: ['scores', 'mistakes', 'suggestions', 'overallFeedback']
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: `Please grade this text:\n\n"${userText}"` }] }],
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.3
            }
        })

        const parsed = JSON.parse(response.text ?? '{}')
        return NextResponse.json(parsed)

    } catch (error) {
        console.error('Grade writing error:', error)
        return NextResponse.json({ error: 'Grading failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
    }
}
