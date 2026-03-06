import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const { transcript, expectedTopic } = await req.json()

        if (!transcript || transcript.trim().length === 0) {
            return NextResponse.json({
                fluency: 0, grammar: 0, vocabulary: 0, overall: 0,
                feedback: "No speech detected. Please ensure your microphone is working and you speak clearly."
            })
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
            }
        })

        const prompt = `
        You are an expert English Language evaluator.
        The user was asked to speak about the following topic: "${expectedTopic}"
        
        Here is the transcribed text of what they said:
        "${transcript}"
        
        Evaluate this strictly on a scale of 0 to 100 for three categories:
        1. Fluency (coherence, flow, ability to stay on topic)
        2. Grammar (correct verb tenses, sentence structure, lack of mistakes)
        3. Vocabulary (richness, context-appropriate words, variety)
        
        Provide a short (2-3 sentences max) encouraging feedback message pointing out one good thing and one area for improvement.
        
        Return ONLY valid JSON with this exact structure (no markdown blocks, no other text):
        {
          "fluency": number,
          "grammar": number,
          "vocabulary": number,
          "feedback": "string"
        }
        `

        const result = await model.generateContent(prompt)

        const rawText = result.response.text() || "{}"
        const parsed = JSON.parse(rawText)

        const overall = Math.round((parsed.fluency + parsed.grammar + parsed.vocabulary) / 3)

        return NextResponse.json({
            fluency: parsed.fluency || 50,
            grammar: parsed.grammar || 50,
            vocabulary: parsed.vocabulary || 50,
            overall: overall,
            feedback: parsed.feedback || "Good effort! Keep practicing to improve your score."
        })

    } catch (error) {
        console.error("Speaking Grade API Error:", error)
        return NextResponse.json(
            { error: "Failed to grade speaking response" },
            { status: 500 }
        )
    }
}
