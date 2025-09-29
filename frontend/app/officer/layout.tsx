import type React from "react"
import type { Metadata } from "next"
import { OfficerSidebar } from "@/components/officer/officer-sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export const metadata: Metadata = {
  title: "Officer Dashboard",
  description: "ALX Ethiopia officer dashboard for tracking referral performance and managing recruitment links.",
  robots: {
    index: false,
    follow: false,
  },
}

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
