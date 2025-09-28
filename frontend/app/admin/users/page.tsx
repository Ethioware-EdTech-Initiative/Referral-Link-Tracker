"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminUsersPage } from "@/components/admin/admin-users-page"

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminUsersPage />
    </ProtectedRoute>
  )
}
