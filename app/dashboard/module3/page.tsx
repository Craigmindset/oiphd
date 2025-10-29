"use client";

import { Module3 } from "@/components/dashboard/module-3";
import { ProtectedRoute } from "@/components/protected-route";

export default function Module3Page() {
  return (
    <ProtectedRoute requiredModule="module2">
      <Module3 />
    </ProtectedRoute>
  );
}
