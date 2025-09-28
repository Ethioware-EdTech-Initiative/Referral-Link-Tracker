import type React from "react"
import { OfficerSidebar } from "@/components/officer/officer-sidebar"
import { ProtectedRoute } from "@/components/protected-route"

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="officer">
      <div className="flex h-screen bg-background">
        <OfficerSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
