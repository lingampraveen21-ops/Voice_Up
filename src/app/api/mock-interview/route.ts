import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { type, answers } = await req.json()

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json({ error: 'Invalid answers provided' }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'API key missing' }, { status: 500 })

        const genAI = new GoogleGenerativeAI(apiKey)

        const systemInstruction = `
        You are an expert ${type} Interviewer and English Assessor.
        You are evaluating a candidate's verbal interview responses based on transcripts.
        
        The candidate was asked these questions, and here are their transcribed answers:
        ${answers.map((a: { q: string, a: string }, i: number) => `Q${i + 1}: ${a.q}\nA${i + 1}: ${a.a}`).join('\n\n')}
        
        Grade the candidate strictly. Return JSON exactly matching the schema.
        Scores are 0-100.
        Provide a final grade (A, B, C, D) and an overall "Interview Ready" percentage.
        `

        const responseSchema: ResponseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                overallGrade: { type: SchemaType.STRING, description: 'Single letter grade A, B, C, D, or F' },
                readyPercentage: { type: SchemaType.INTEGER, description: 'Percentage 0-100 indicating how interview ready they are' },
                scores: {
                    type: SchemaType.OBJECT,
                    properties: {
                        fluency: { type: SchemaType.INTEGER, description: 'How smoothly they speak without excessive pauses 0-100' },
                        grammar: { type: SchemaType.INTEGER, description: 'Grammar correctness 0-100' },
                        vocabulary: { type: SchemaType.INTEGER, description: 'Lexical resource and appropriate word choice 0-100' },
                        technical: { type: SchemaType.INTEGER, description: 'Accuracy of the actual content/technical answers 0-100' },
                        confidence: { type: SchemaType.INTEGER, description: 'Perceived confidence based on phrasing 0-100' }
                    },
                    required: ['fluency', 'grammar', 'vocabulary', 'technical', 'confidence']
                },
                topMistakes: {
                    type: SchemaType.ARRAY,
                    description: 'Top 3 pronunciation or grammar mistakes made across all answers',
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            original: { type: SchemaType.STRING },
                            corrected: { type: SchemaType.STRING },
                            explanation: { type: SchemaType.STRING }
                        }
                    }
                },
                feedback: { type: SchemaType.STRING, description: 'A short 2-3 sentence overall summary of their performance.' }
            },
            required: ['overallGrade', 'readyPercentage', 'scores', 'topMistakes', 'feedback']
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            systemInstruction,
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.2
            }
        })

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'Please evaluate the interview responses.' }] }]
        })

        const parsed = JSON.parse(result.response.text() ?? '{}')
        return NextResponse.json(parsed)

    } catch (error) {
        console.error('Mock Interview Grading error:', error)
        return NextResponse.json({ error: 'Grading failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
    }
}
