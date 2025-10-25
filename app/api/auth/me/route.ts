import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // TODO: Verify token and fetch user from database
    // For now, return mock user
    const mockUser = {
      id: "1",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
    }

    return NextResponse.json(mockUser)
  } catch (error) {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 })
  }
}
