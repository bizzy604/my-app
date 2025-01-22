import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" }, 
        { status: 401 }
      )
    }

    return NextResponse.json(session.user)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user" }, 
      { status: 500 }
    )
  }
}
