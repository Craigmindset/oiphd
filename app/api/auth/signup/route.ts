import { type NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "../_supabase";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const {
      email,
      password,
      firstName,
      lastName,
      gender,
      phone,
      address,
      country,
      occupation,
      expectations,
      status,
      registeringForSomeone,
    } = data;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingProfile } = await adminSupabase
      .from("user_profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      // Profile exists, check if auth user exists
      const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
      const authUser = authUsers.users.find((u) => u.id === existingProfile.id);

      if (authUser) {
        return NextResponse.json(
          { error: "User already exists with this email" },
          { status: 400 }
        );
      }

      // Profile exists but no auth user - create auth user with existing profile ID
      const { data: authData, error: authError } =
        await adminSupabase.auth.admin.createUser({
          id: existingProfile.id, // Use existing profile ID
          email,
          password,
          email_confirm: true,
        });

      if (authError) {
        console.error("Auth creation error:", authError);
        return NextResponse.json(
          { error: authError.message || "Failed to create auth user" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Registration successful! You can now login.",
        userId: authData.user.id,
      });
    }

    // No existing profile - create new auth user and profile
    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error("Auth creation error:", authError);
      return NextResponse.json(
        { error: authError?.message || "Failed to create user" },
        { status: 400 }
      );
    }

    // Create user profile using admin client (bypasses RLS)
    const { error: profileError } = await adminSupabase
      .from("user_profiles")
      .insert([
        {
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          gender: gender || null,
          phone: phone || null,
          address: address || null,
          country: country || null,
          occupation: occupation || null,
          expectations: expectations || null,
          status: status || "pending",
          registering_for_someone: registeringForSomeone || null,
          role: "user", // Default role
        },
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Try to clean up the auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        {
          error: `Failed to create user profile: ${profileError.message}`,
          details: profileError.details,
          hint: profileError.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! You can now login.",
      userId: authData.user.id,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed: " + error.message },
      { status: 500 }
    );
  }
}
