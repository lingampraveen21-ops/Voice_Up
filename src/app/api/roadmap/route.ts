import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { level, goal, dailyCommitment, interviewDate, timeline } = await req.json()

        if (!level || !goal) {
            return NextResponse.json({ error: 'Missing req parameters' }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'API key missing' }, { status: 500 })

        const ai = new GoogleGenAI({ apiKey })

        const timelineDays = timeline || 30

        const systemInstruction = `
        You are NOVA, an expert English Language Planner.
        Given the user's current CEFR level (${level}), their goal (${goal}), their daily time commitment (${dailyCommitment} mins/day), and an upcoming target interview date (${interviewDate}), generate a realistic day-by-day learning roadmap for ${timelineDays} days.
        
        Generate exactly 7 major milestones spread across the ${timelineDays}-day plan (e.g., "Day 1", "Day ${Math.round(timelineDays * 0.15)}", "Day ${Math.round(timelineDays * 0.3)}", etc.) representing chunks of study.
        For each, provide a title, a short actionable description, a skill (one of: speaking, listening, reading, writing, grammar, vocabulary), and assign it either:
        "completed", "current", or "locked". Only the first one should be "current", rest "locked".
        
        Return JSON matching the schema.
        `

        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                roadmap: {
                    type: Type.ARRAY,
                    description: 'Array of 7 milestone steps',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            dayLabel: { type: Type.STRING, description: 'E.g., Day 1, Week 2, Final Prep' },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            skill: { type: Type.STRING, description: 'One of: speaking, listening, reading, writing, grammar, vocabulary' },
                            status: { type: Type.STRING, description: 'must be either: completed, current, locked' }
                        }
                    }
                },
                advice: { type: Type.STRING, description: 'One sentence of motivational advice' }
            },
            required: ['roadmap', 'advice']
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: `Create a plan for Level ${level} aiming to achieve: ${goal}` }] }],
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
        console.error('Roadmap Geneartion error:', error)
        return NextResponse.json({ error: 'Generation failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
    }
}
