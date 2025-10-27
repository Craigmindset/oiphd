"use client";

import { Overview } from "@/components/dashboard/overview";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Overview />
    </ProtectedRoute>
  );
}
