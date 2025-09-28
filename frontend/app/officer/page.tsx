"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { OfficerDashboard } from "@/components/officer/officer-dashboard"

export default function OfficerPage() {
  return (
    <ProtectedRoute requiredRole="officer">
      <OfficerDashboard />
    </ProtectedRoute>
  )
}
