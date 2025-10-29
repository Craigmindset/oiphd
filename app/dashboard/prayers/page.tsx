"use client";

import { Prayers } from "@/components/dashboard/prayers";
import { ProtectedRoute } from "@/components/protected-route";

export default function PrayersPage() {
  return (
    <ProtectedRoute requiredModule="module2">
      <Prayers />
    </ProtectedRoute>
  );
}
