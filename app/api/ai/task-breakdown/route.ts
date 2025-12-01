import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key non configurée" },
        { status: 500 }
      )
    }

    const { task } = await request.json()

    if (!task) {
      return NextResponse.json(
        { error: "Task required" },
        { status: 400 }
      )
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an ADHD-friendly task breakdown assistant. Break down tasks into very small, specific, actionable steps that take 5-15 minutes each. Each step should:\n" +
            "1. Be extremely specific with action verbs (e.g., 'Open Word document' not 'Start writing')\n" +
            "2. Include a time estimate in parentheses (e.g., 'Pick up all clothes from floor (5 min)')\n" +
            "3. Be sequential (step 2 depends on step 1)\n" +
            "4. Be achievable in 5-15 minutes\n" +
            "5. Use clear, simple language\n\n" +
            "Format: First, provide a total time estimate for the entire task, then list the steps.\n" +
            "TOTAL_TIME: [total minutes]\n\n" +
            "1. Step description (X min)\n" +
            "2. Step description (X min)\n" +
            "...\n\n" +
            "Example:\n" +
            "TOTAL_TIME: 45\n\n" +
            "1. Open Word document (2 min)\n" +
            "2. Create essay outline with headings (5 min)\n" +
            "3. Write introduction paragraph (10 min)\n" +
            "4. Find 3 sources for body paragraphs (10 min)\n" +
            "5. Write first body paragraph (15 min)\n" +
            "6. Write second body paragraph (15 min)\n" +
            "7. Write conclusion paragraph (8 min)\n" +
            "8. Review and proofread (10 min)\n" +
            "Do not include any explanation or additional text.",
        },
        {
          role: "user",
          content: `Break down this task into ADHD-friendly micro-steps with time estimates: ${task}`,
        },
      ],
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || ""
    
    // Extract total time estimate
    const totalTimeMatch = response.match(/TOTAL_TIME:\s*(\d+)/i)
    const totalTime = totalTimeMatch ? parseInt(totalTimeMatch[1]) : null
    
    // Extract steps with time estimates
    const steps = response
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim()
        return trimmed && !trimmed.match(/^TOTAL_TIME:/i) && trimmed.match(/^\d+[\.\)]/)
      })
      .map((line) => {
        // Extract step text and time estimate
        const match = line.match(/^\d+[\.\)]\s*(.+?)\s*\((\d+)\s*(?:min|minutes?)\)/i)
        if (match) {
          return match[1].trim() + ` (${match[2]} min)`
        }
        // Fallback: just remove the number prefix and ensure time estimate
        let step = line.replace(/^\d+[\.\)]\s*/, "").trim()
        if (!step.match(/\(\d+\s*(?:min|minutes?)\)/i)) {
          step += " (10 min)"
        }
        return step
      })
      .filter((step) => step && step.length > 0)

    return NextResponse.json({ steps, totalTime })
  } catch (error: any) {
    console.error("Groq error:", error)
    return NextResponse.json(
      { error: error.message || "Error generating steps" },
      { status: 500 }
    )
  }
}

