import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  return NextResponse.json({ 
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 8) || 'missing'
  })
}

export async function POST(req: Request) {
  try {
    const { userGoal, level } = await req.json()
    console.log('=== ROADMAP CALLED WITH ===', { userGoal, level })
    console.log('=== API KEY EXISTS ===', !!process.env.GEMINI_API_KEY)

    if (!userGoal) {
      return NextResponse.json({ error: 'userGoal is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    console.log('Model created, sending prompt...')
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY)

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

    console.log('=== GEMINI RAW RESPONSE ===')
    console.log(responseText)
    console.log('=== END RESPONSE ===')

    if (!responseText) {
      throw new Error('Model returned empty response.')
    }

    const cleanText = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim()

    // Try to extract JSON object if there's extra text around it
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON object found in response:', cleanText)
      return NextResponse.json({ error: 'No valid JSON in AI response' }, { status: 500 })
    }

    let parsed
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('JSON parse failed:', parseError)
      console.error('Attempted to parse:', jsonMatch[0])
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack'
    
    console.error('=== ROADMAP ERROR START ===')
    console.error('Message:', errorMessage)
    console.error('Stack:', errorStack)
    console.error('=== ROADMAP ERROR END ===')
    
    return NextResponse.json({
      error: 'Gemini API failed',
      details: errorMessage
    }, { status: 500 })
  }
}
