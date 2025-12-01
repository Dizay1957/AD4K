import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Update user
    if (body.name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: body.name },
      })
    }

    // Update or create preferences
    await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        language: body.language || "FR",
        focusTime: body.focusTime || 25,
        breakTime: body.breakTime || 5,
        longBreakTime: body.longBreakTime || 15,
        soundPreference: body.soundPreference || null,
        notificationsEnabled: body.notificationsEnabled ?? true,
        theme: body.theme || "colorful",
        dyslexiaFont: body.dyslexiaFont || false,
        largeUIMode: body.largeUIMode || false,
        highContrast: body.highContrast || false,
        reminderFrequency: body.reminderFrequency || "normal",
        autoStartNextCycle: body.autoStartNextCycle || false,
        pomPersonality: body.pomPersonality || "warm-accountability",
      },
      update: {
        ...(body.language && { language: body.language }),
        ...(body.focusTime && { focusTime: body.focusTime }),
        ...(body.breakTime && { breakTime: body.breakTime }),
        ...(body.longBreakTime && { longBreakTime: body.longBreakTime }),
        ...(body.soundPreference !== undefined && { soundPreference: body.soundPreference }),
        ...(body.notificationsEnabled !== undefined && { notificationsEnabled: body.notificationsEnabled }),
        ...(body.theme && { theme: body.theme }),
        ...(body.dyslexiaFont !== undefined && { dyslexiaFont: body.dyslexiaFont }),
        ...(body.largeUIMode !== undefined && { largeUIMode: body.largeUIMode }),
        ...(body.highContrast !== undefined && { highContrast: body.highContrast }),
        ...(body.reminderFrequency && { reminderFrequency: body.reminderFrequency }),
        ...(body.autoStartNextCycle !== undefined && { autoStartNextCycle: body.autoStartNextCycle }),
        ...(body.pomPersonality && { pomPersonality: body.pomPersonality }),
      },
    })

    return NextResponse.json({ message: "Profile updated" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating profile" },
      { status: 500 }
    )
  }
}

