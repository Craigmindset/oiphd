import { type NextRequest, NextResponse } from "next/server";
import { adminSupabase, authSupabase } from "../../auth/_supabase";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: userData, error: userError } = await authSupabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await adminSupabase
      .from("user_profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all users (non-admin)
    const { data: users, error: usersError } = await adminSupabase
      .from("user_profiles")
      .select("*")
      .eq("role", "user")
      .order("created_at", { ascending: false });

    if (usersError) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Fetch module progress for all users
    const { data: progressData } = await adminSupabase
      .from("module_progress")
      .select("user_id, module_id, completed");

    // Calculate progress percentage for each user
    const MODULES = ["module1", "module2", "module3", "prayers", "transformation"];
    const userProgress: Record<string, number> = {};
    
    if (progressData && users) {
      for (const user of users) {
        const completed = progressData.filter(
          (row) => row.user_id === user.id && row.completed
        ).length;
        userProgress[user.id] = Math.round((completed / MODULES.length) * 100);
      }
    }

    return NextResponse.json({
      users: users || [],
      progressMap: userProgress,
    });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
