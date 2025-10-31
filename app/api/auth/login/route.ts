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
      console.error("Supabase sign in error:", signInError);
      return NextResponse.json(
        { error: signInError?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Fetch user profile (role, etc.)
    const { data: profile, error: profileError } = await adminSupabase
      .from("user_profiles")
      .select("id, email, first_name, last_name, role")
      .eq("id", signInData.user.id)
      .single();
    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: profileError?.message || "User profile not found" },
        { status: 401 }
      );
    }

    // Map snake_case to camelCase for consistency
    const userData = {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
    };

    // Set auth cookie with Supabase access token
    const response = NextResponse.json(userData);
    response.cookies.set("auth_token", signInData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Also send back the session data so client can store it
    response.headers.set(
      "X-Supabase-Session",
      JSON.stringify(signInData.session)
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
