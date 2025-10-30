"use client";

import type React from "react";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
  requiredModule?: "module2" | "module3" | "module4";
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredModule,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    // If no requiredModule is specified, allow access
    if (!requiredModule) {
      setAllowed(true);
      setLoading(false);
      return;
    }

    // Admins bypass module completion requirements
    if (user.role === "admin") {
      setAllowed(true);
      setLoading(false);
      return;
    }

    async function checkCompletion() {
      if (!user) return; // Extra safety check for TypeScript
      const { data, error } = await supabase
        .from("module_progress")
        .select("completed")
        .eq("user_id", user.id)
        .eq("module_id", requiredModule)
        .single();

      if (error || !data || !data.completed) {
        setAllowed(false);
      } else {
        setAllowed(true);
      }
      setLoading(false);
    }
    checkCompletion();
  }, [user, requiredModule, router]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <div className="text-2xl font-bold text-red-600 mb-2">
          Access Restricted
        </div>
        <div className="text-gray-700 mb-4">
          Please complete Module 2 before accessing this section.
        </div>
        <a href="/dashboard/module2" className="text-blue-600 underline">
          Go to Module 2
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
