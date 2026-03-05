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
        if (!apiKey) return NextResponse.json({ error: 'API key missing' }, { status: 500 })

        const ai = new GoogleGenAI({ apiKey })

        const systemInstruction = `
        You are NOVA, an expert English learning planner.
        The user has described their goal in their own words: "${userGoal}"
        Their current CEFR level is: ${level || 'unknown'}.

        Understand the user's intent from their natural language description.
        Extract: their specific goal, timeline (in days), and any daily time commitment they mentioned.
        Then generate a realistic day-by-day learning roadmap with exactly 7 major milestones.

        For each milestone provide:
        - dayLabel: e.g. "Day 1", "Day 5", "Week 2", "Final Day"
        - title: a short action-oriented title
        - description: 1-2 sentences of what to practice and how
        - skill: one of: speaking, listening, reading, writing, grammar, vocabulary
        - status: the first milestone is "current", all others are "locked"

        Also write one line of motivational advice tailored to their specific goal.
        Return valid JSON matching the schema.
        `

        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                roadmap: {
                    type: Type.ARRAY,
                    description: 'Array of exactly 7 milestone steps',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            dayLabel: { type: Type.STRING, description: 'E.g. Day 1, Day 5, Week 2, Final Day' },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            skill: { type: Type.STRING, description: 'One of: speaking, listening, reading, writing, grammar, vocabulary' },
                            status: { type: Type.STRING, description: 'Either: current, locked' }
                        },
                        required: ['dayLabel', 'title', 'description', 'skill', 'status']
                    }
                },
                advice: { type: Type.STRING, description: 'One sentence of personalized motivational advice' }
            },
            required: ['roadmap', 'advice']
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: userGoal }] }],
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.7
            }
        })

        const parsed = JSON.parse(response.text ?? '{}')
        return NextResponse.json(parsed)

    } catch (error) {
        console.error('Roadmap generation error:', error)
        return NextResponse.json({
            error: 'Generation failed',
            details: error instanceof Error ? error.message : 'Unknown'
        }, { status: 500 })
    }
}
