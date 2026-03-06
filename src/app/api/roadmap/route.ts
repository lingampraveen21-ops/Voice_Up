import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userGoal, level } = await req.json()

    if (!userGoal) {
      return NextResponse.json({ error: 'userGoal is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const today = new Date().toISOString().split('T')[0]

    const prompt = `You are NOVA, an expert English learning planner.
The user's goal: "${userGoal}"
Their current CEFR level: ${level || 'A1'}.

Generate a realistic day-by-day learning roadmap with exactly 7 major milestones.

Return ONLY a valid JSON object with this exact format (no markdown, no explanation):
{
  "roadmap": [
    {
      "dayLabel": "Day 1-4",
      "title": "Introduction to Professional Greetings",
      "description": "Learn and practice formal greetings and self-introductions.",
      "skill": "speaking",
      "status": "not_started"
    }
  ],
  "advice": "One sentence of motivational advice"
}

Rules:
- Generate exactly 7 milestones
- Alternate skills: speaking, listening, reading, writing, vocabulary, grammar
- Match difficulty to CEFR level: ${level || 'A1'}
- Focus on goal: "${userGoal}"
- First dayLabel starts from "${today}"
- status always "not_started"
- Keep descriptions under 2 sentences`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    if (!responseText) {
      throw new Error('Model returned empty response.')
    }

    const cleanText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    let parsed
    try {
      parsed = JSON.parse(cleanText)
    } catch {
      console.error('Failed to parse Gemini response:', responseText)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    if (!parsed.roadmap || !Array.isArray(parsed.roadmap)) {
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
