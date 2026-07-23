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

    // Fetch statistics using admin client (bypasses RLS)
    
    // 1. Total users
    const { count: totalUsers } = await adminSupabase
      .from("user_profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "user");

    // 2. Total profiles
    const { count: totalProfiles } = await adminSupabase
      .from("user_profiles")
      .select("id", { count: "exact", head: true });

    // 3. Module completion data
    const { data: progressData } = await adminSupabase
      .from("module_progress")
      .select("user_id, module_id, completed")
      .eq("completed", true)
      .in("module_id", ["module1", "module2", "module3"]);

    // Count unique users who completed each module
    const module1Users = new Set(
      progressData?.filter((p) => p.module_id === "module1").map((p) => p.user_id) || []
    );
    const module2Users = new Set(
      progressData?.filter((p) => p.module_id === "module2").map((p) => p.user_id) || []
    );
    const module3Users = new Set(
      progressData?.filter((p) => p.module_id === "module3").map((p) => p.user_id) || []
    );

    // 4. Prayer requests count
    const { count: prayerRequests } = await adminSupabase
      .from("support_requests")
      .select("id", { count: "exact", head: true })
      .eq("request_type", "prayer");

    // 5. Testimonies count
    const { count: testimonies } = await adminSupabase
      .from("testimonies")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalProfiles: totalProfiles || 0,
      moduleCompletion: {
        module1: module1Users.size,
        module2: module2Users.size,
        module3: module3Users.size,
      },
      prayerRequests: prayerRequests || 0,
      testimonies: testimonies || 0,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
