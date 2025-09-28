"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { OfficerLinksPage } from "@/components/officer/officer-links-page"

export default function LinksPage() {
  return (
    <ProtectedRoute requiredRole="officer">
      <OfficerLinksPage />
    </ProtectedRoute>
  )
}
