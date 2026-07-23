import { type NextRequest, NextResponse } from "next/server";
import { adminSupabase, authSupabase } from "../_supabase";

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

    // Authenticate with Supabase (use authSupabase with anon key)
    console.log(`[LOGIN] Attempting sign in with email: ${email}`);
    
    const { data: signInData, error: signInError } =
      await authSupabase.auth.signInWithPassword({
        email,
        password,
      });
    
    console.log(`[LOGIN] Sign in result - Success: ${!!signInData.session}, User ID: ${signInData.user?.id}`);
    
    if (signInError || !signInData.session) {
      console.error("Supabase sign in error:", signInError);
      return NextResponse.json(
        { error: signInError?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Fetch user profile (role, etc.)
    console.log(`[LOGIN] Fetching profile for user ID: ${signInData.user.id}`);
    
    const { data: profile, error: profileError, count } = await adminSupabase
      .from("user_profiles")
      .select("id, email, first_name, last_name, role", { count: 'exact' })
      .eq("id", signInData.user.id)
      .single();
    
    console.log(`[LOGIN] Profile query result - Count: ${count}, Error: ${profileError?.code}, Data: ${profile ? 'Found' : 'Not found'}`);
    
    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      console.error("User ID that failed:", signInData.user.id);
      
      // Try to find any profile with this email for debugging
      const { data: debugProfiles } = await adminSupabase
        .from("user_profiles")
        .select("id, email")
        .eq("email", signInData.user.email);
      
      console.error("Profiles with this email:", debugProfiles);
      
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
