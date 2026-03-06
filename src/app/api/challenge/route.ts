import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const dynamic = 'force-dynamic'

export async function GET() {
    // Using service role to bypass RLS for global challenge management
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    try {
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

        // 1. Try to fetch today's challenge
        const { data: existing } = await supabaseAdmin
            .from('daily_challenges')
            .select('prompt')
            .eq('date', today)
            .single()

        if (existing?.prompt) {
            return NextResponse.json({ prompt: existing.prompt, date: today })
        }

        // 2. If it doesn't exist, we generate a new one via Gemini
        const aiPrompt = `
        You are an expert English tutor. Generate a single, thought-provoking speaking prompt for an ESL student.
        It should be engaging and require about 2 minutes to answer fully.
        Examples: "Describe a time you completely changed your mind about something important.", "If you could redesign the education system from scratch, what would it look like?"
        Return ONLY the prompt string, no quotes, no extra text.
        `

        const result = await geminiModel.generateContent(aiPrompt)

        const responseText = result.response.text()
        const newPrompt = responseText ? responseText.replace(/^"|"$/g, '').trim() : "Describe the most important lesson you've learned this year."

        // 3. Save it to Supabase so all users get the same one today
        // Note: we swallow the error if the table doesn't exist yet and just return the generated prompt gracefully.
        await supabaseAdmin.from('daily_challenges').insert([{ date: today, prompt: newPrompt }])

        return NextResponse.json({ prompt: newPrompt, date: today })

    } catch (error) {
        console.error("Daily Challenge API Error:", error)
        // Fallback for safety if DB table isn't migrated
        return NextResponse.json({ prompt: "What is a major goal you have for the next five years, and how do you plan to achieve it?", date: new Date().toISOString().split('T')[0] })
    }
}
