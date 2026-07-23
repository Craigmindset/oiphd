import { type NextRequest, NextResponse } from "next/server";
import { adminSupabase, authSupabase } from "../../auth/_supabase";

// GET - Fetch all support requests
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

    // Fetch support requests
    const { data: requestsData, error: requestsError } = await adminSupabase
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestsError) {
      return NextResponse.json(
        { error: "Failed to fetch support requests" },
        { status: 500 }
      );
    }

    // Fetch user profiles for each request
    if (requestsData && requestsData.length > 0) {
      const userIds = [...new Set(requestsData.map((r) => r.user_id))];

      const { data: profilesData } = await adminSupabase
        .from("user_profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);

      // Merge the data
      const mergedData = requestsData.map((request) => ({
        ...request,
        user_profiles: profilesData?.find((p) => p.id === request.user_id) || null,
      }));

      return NextResponse.json({ requests: mergedData });
    }

    return NextResponse.json({ requests: [] });
  } catch (error: any) {
    console.error("Fetch support requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch support requests" },
      { status: 500 }
    );
  }
}

// PATCH - Update support request
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { id, status, admin_response } = body;

    if (!id) {
      return NextResponse.json({ error: "Request ID required" }, { status: 400 });
    }

    // Build update object
    const updates: any = {};
    if (status) updates.status = status;
    if (admin_response !== undefined) {
      updates.admin_response = admin_response;
      updates.responded_at = new Date().toISOString();
      if (!status) updates.status = "resolved";
    }

    // Update support request
    const { error: updateError } = await adminSupabase
      .from("support_requests")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update support request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update support request error:", error);
    return NextResponse.json(
      { error: "Failed to update support request" },
      { status: 500 }
    );
  }
}
