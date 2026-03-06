import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { userText, taskType, userLevel } = await req.json()
        if (!userText?.trim()) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'API key missing' }, { status: 500 })

        const genAI = new GoogleGenerativeAI(apiKey)

        const systemInstruction = `
    You are an English writing coach grading a student's text.
    Student level: ${userLevel || 'B1'}. Task type: ${taskType || 'General Writing'}.
    
    Grade strictly but constructively. Return JSON exactly matching the schema.
    Scores are 0-100. Identify real mistakes, not nitpicks.
    `

        const responseSchema: ResponseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                scores: {
                    type: SchemaType.OBJECT,
                    properties: {
                        grammar: { type: SchemaType.INTEGER, description: 'Grammar correctness 0-100' },
                        formality: { type: SchemaType.INTEGER, description: 'Appropriate register/formality 0-100' },
                        structure: { type: SchemaType.INTEGER, description: 'Logical organization 0-100' },
                        tone: { type: SchemaType.INTEGER, description: 'Tone consistency and clarity 0-100' },
                    },
                    required: ['grammar', 'formality', 'structure', 'tone']
                },
                mistakes: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            original: { type: SchemaType.STRING },
                            corrected: { type: SchemaType.STRING },
                            explanation: { type: SchemaType.STRING }
                        }
                    }
                },
                suggestions: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                overallFeedback: { type: SchemaType.STRING, description: 'One encouraging sentence of overall feedback' }
            },
            required: ['scores', 'mistakes', 'suggestions', 'overallFeedback']
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite-preview-06-17',
            systemInstruction,
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.3
            }
        })

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: `Please grade this text:\n\n"${userText}"` }] }]
        })

        const parsed = JSON.parse(result.response.text() ?? '{}')
        return NextResponse.json(parsed)

    } catch (error) {
        console.error('Grade writing error:', error)
        return NextResponse.json({ error: 'Grading failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
    }
}
