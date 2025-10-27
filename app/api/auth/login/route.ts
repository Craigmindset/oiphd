import { type NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "../_supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate with Supabase
    const { data: signInData, error: signInError } =
      await adminSupabase.auth.signInWithPassword({
        email,
        password,
      });
    if (signInError || !signInData.session) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Fetch user profile (role, etc.)
    const { data: profile, error: profileError } = await adminSupabase
      .from("user_profiles")
      .select("id, email, firstName, lastName, role")
      .eq("id", signInData.user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 401 }
      );
    }

    // Set auth cookie with Supabase access token
    const response = NextResponse.json(profile);
    response.cookies.set("auth_token", signInData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
