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

    const { topic } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: "Topic required" },
        { status: 400 }
      )
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an ADHD coach who gives practical and encouraging advice. Respond in English in a concise and actionable manner.",
        },
        {
          role: "user",
          content: `Give me advice on: ${topic}`,
        },
      ],
      max_tokens: 500,
    })

    const advice = completion.choices[0]?.message?.content || ""

    return NextResponse.json({ advice })
  } catch (error: any) {
    console.error("Groq error:", error)
    return NextResponse.json(
      { error: error.message || "Error generating advice" },
      { status: 500 }
    )
  }
}

