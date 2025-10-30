import { type NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "../_supabase";

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // Get user from Supabase using the new access token
    const { data: userData, error: userError } =
      await adminSupabase.auth.getUser(access_token);
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await adminSupabase
      .from("user_profiles")
      .select("id, email, first_name, last_name, role")
      .eq("id", userData.user.id)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 401 }
      );
    }

    // Map snake_case to camelCase for consistency
    const userProfile = {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
    };

    // Update the auth cookie with the new access token
    const response = NextResponse.json(userProfile);
    response.cookies.set("auth_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
