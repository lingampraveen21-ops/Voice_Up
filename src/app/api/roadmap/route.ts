import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { userGoal, level } = await req.json()

        if (!userGoal) {
            return NextResponse.json({ error: 'userGoal is required' }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Key is missing. Check .env.local' }, { status: 500 })
        }

        const ai = new GoogleGenAI({ apiKey })

        const systemInstruction = `
You are NOVA, an expert English learning planner.
The user's goal: "${userGoal}"
Their current CEFR level: ${level || 'unknown'}.

Understand the user's intent from their natural language description.
Extract: their specific goal, timeline, and daily commitment.
Then generate a realistic day-by-day learning roadmap with exactly 7 major milestones/steps.

Return valid JSON matching the schema.
`

        // Reverting to the simpler Array schema which is proven to work in grade-writing/route.ts
        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                roadmap: {
                    type: Type.ARRAY,
                    description: 'The 7 milestone steps',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            dayLabel: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            skill: { type: Type.STRING },
                            status: { type: Type.STRING }
                        },
                        required: ['dayLabel', 'title', 'description', 'skill', 'status']
                    }
                },
                advice: { type: Type.STRING, description: 'One sentence of motivational advice' }
            },
            required: ['roadmap', 'advice']
        }

        // Using gemini-1.5-flash for maximum stability with structured output
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: userGoal }] }],
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.7,
            }
        })

        const responseText = response.text ?? '{}'
        if (!responseText || responseText === '{}') {
            throw new Error('Model returned empty response.')
        }

        const parsed = JSON.parse(responseText)
        return NextResponse.json(parsed)

    } catch (error) {
        console.error('Roadmap API Error:', error)
        return NextResponse.json({
            error: 'Gemini API failed',
            details: error instanceof Error ? error.message : 'Unknown server error'
        }, { status: 500 })
    }
}
