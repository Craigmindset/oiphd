import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const { email, password, firstName, lastName } = data

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TODO: Implement actual user creation with database
    // TODO: Hash password before storing
    // TODO: Send verification email

    const mockUser = {
      id: "1",
      email,
      firstName,
      lastName,
      role: "user",
    }

    // Set auth cookie
    const response = NextResponse.json(mockUser)
    response.cookies.set("auth_token", "mock_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
