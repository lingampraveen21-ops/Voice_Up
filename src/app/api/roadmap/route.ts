import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

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

        const today = new Date().toISOString().split('T')[0]

        const prompt = `You are NOVA, an expert English learning planner.
The user's goal: "${userGoal}"
Their current CEFR level: ${level || 'unknown'}.

Generate a realistic day-by-day learning roadmap with exactly 7 major milestones/steps.

Return ONLY a valid JSON object with this exact format (no markdown, no explanation):
{
  "roadmap": [
    {
      "dayLabel": "Day 1-4",
      "title": "Introduction to Professional Greetings",
      "description": "Learn and practice formal greetings, self-introductions, and small talk for professional settings.",
      "skill": "speaking",
      "status": "not_started"
    }
  ],
  "advice": "One sentence of motivational advice"
}

Rules:
- Generate exactly 7 milestones
- Alternate skills between: speaking, listening, reading, writing, vocabulary, grammar
- Match difficulty to CEFR level: ${level || 'A1'}
- Focus on the user's goal: "${userGoal}"
- First dayLabel starts from "${today}"
- status should always be "not_started"
- Keep descriptions under 2 sentences`

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7,
            }
        })

        const responseText = response.text ?? ''
        if (!responseText) {
            throw new Error('Model returned empty response.')
        }

        // Clean markdown fences if present, then parse
        const cleanText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

        let parsed
        try {
            parsed = JSON.parse(cleanText)
        } catch {
            console.error('Failed to parse Gemini response:', responseText)
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
        }

        // Ensure the response has the expected shape
        if (!parsed.roadmap || !Array.isArray(parsed.roadmap)) {
            // If Gemini returned a raw array, wrap it
            if (Array.isArray(parsed)) {
                parsed = { roadmap: parsed, advice: 'Stay consistent and practice daily!' }
            } else {
                return NextResponse.json({ error: 'Invalid roadmap structure from AI' }, { status: 500 })
            }
        }

        return NextResponse.json(parsed)

    } catch (error) {
        console.error('Roadmap API Error:', error instanceof Error ? error.message : error)
        return NextResponse.json({
            error: 'Gemini API failed',
            details: error instanceof Error ? error.message : 'Unknown server error'
        }, { status: 500 })
    }
}
