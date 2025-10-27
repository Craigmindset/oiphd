import { type NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "../_supabase";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user from Supabase using the access token
    const { data: userData, error: userError } =
      await adminSupabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Fetch user profile (role, etc.)
    const { data: profile, error: profileError } = await adminSupabase
      .from("user_profiles")
      .select("id, email, firstName, lastName, role")
      .eq("id", userData.user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 401 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }
}
