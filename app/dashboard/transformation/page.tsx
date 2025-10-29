"use client";

import { Transformation } from "@/components/dashboard/transformation";
import { ProtectedRoute } from "@/components/protected-route";

export default function TransformationPage() {
  return (
    <ProtectedRoute requiredModule="module2">
      <Transformation />
    </ProtectedRoute>
  );
}
