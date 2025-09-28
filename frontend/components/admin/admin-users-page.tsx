"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useUsers, useUserStats } from "@/hooks/use-api"
import { useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-mutations"
import { formatDate } from "@/lib/api-utils"
import { Users, Search, Plus, Edit, Trash2, Shield, User, Calendar, Mail } from "lucide-react"

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "officer">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deletingUser, setDeletingUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  const { data: users, loading, error, refetch, totalCount, hasNext, hasPrevious } = useUsers(currentPage)
  const { data: userStats, refetch: refetchStats } = useUserStats()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  // Reset to page 1 when creating or deleting users to see the changes
  const resetToFirstPage = () => {
    if (currentPage !== 1) setCurrentPage(1)
  }

  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    password: "",
    is_staff: false,
  })

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterRole === "all" || (filterRole === "admin" && user.is_staff) || (filterRole === "officer" && !user.is_staff)
    return matchesSearch && matchesFilter
  })

  const handleCreateUser = async () => {
    const errors: { [key: string]: string } = {}

    // Form validation
    if (!newUser.email) errors.email = "Email is required"
    if (!newUser.full_name) errors.full_name = "Full name is required"
    if (!newUser.password) errors.password = "Password is required"

    if (newUser.password && newUser.password.length < 8) {
      errors.password = "Password must be at least 8 characters long"
    }

    if (newUser.email && !newUser.email.includes("@")) {
      errors.email = "Please enter a valid email address"
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const result = await createUserMutation.mutate(newUser)
    if (result.success) {
      setIsCreateDialogOpen(false)
      setNewUser({ email: "", full_name: "", password: "", is_staff: false })
      setFormErrors({})
      resetToFirstPage()
      refetch()
      refetchStats()
    } else {
      setFormErrors({ general: result.error || "Failed to create user" })
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    const result = await updateUserMutation.mutate(editingUser.id, {
      email: editingUser.email,
      full_name: editingUser.full_name,
      is_staff: editingUser.is_staff,
    })
    if (result.success) {
      setEditingUser(null)
      refetch()
      refetchStats()
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    const result = await deleteUserMutation.mutate(deletingUser.id)
    if (result.success) {
      setDeletingUser(null)
      resetToFirstPage()
      refetch()
      refetchStats()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {formErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  {formErrors.general}
                </div>
              )}
              <div>
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser({ ...newUser, email: e.target.value })
                    if (formErrors.email) {
                      const newErrors = { ...formErrors }
                      delete newErrors.email
                      setFormErrors(newErrors)
                    }
                  }}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="full_name" className="flex items-center gap-1">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => {
                    setNewUser({ ...newUser, full_name: e.target.value })
                    if (formErrors.full_name) {
                      const newErrors = { ...formErrors }
                      delete newErrors.full_name
                      setFormErrors(newErrors)
                    }
                  }}
                  className={formErrors.full_name ? "border-red-500" : ""}
                />
                {formErrors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.full_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password" className="flex items-center gap-1">
                  Password <span className="text-red-500">*</span>
                  <span className="text-xs text-muted-foreground">(min. 8 characters)</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => {
                    setNewUser({ ...newUser, password: e.target.value })
                    if (formErrors.password) {
                      const newErrors = { ...formErrors }
                      delete newErrors.password
                      setFormErrors(newErrors)
                    }
                  }}
                  className={formErrors.password ? "border-red-500" : ""}
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_staff"
                  checked={newUser.is_staff}
                  onCheckedChange={(checked) => setNewUser({ ...newUser, is_staff: checked })}
                />
                <Label htmlFor="is_staff">Administrator privileges</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                setFormErrors({})
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.loading}>
                {createUserMutation.loading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userStats?.total_users || totalCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                <p className="text-2xl font-bold">{userStats?.total_admins || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Officers</p>
                <p className="text-2xl font-bold">{userStats?.total_officers || 0}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterRole === "all" ? "default" : "outline"}
                onClick={() => setFilterRole("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterRole === "admin" ? "default" : "outline"}
                onClick={() => setFilterRole("admin")}
                size="sm"
              >
                Admins
              </Button>
              <Button
                variant={filterRole === "officer" ? "default" : "outline"}
                onClick={() => setFilterRole("officer")}
                size="sm"
              >
                Officers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers?.length || 0} of {totalCount || 0} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || "No name"}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_staff ? "default" : "secondary"}>
                        {user.is_staff ? "Administrator" : "Officer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "destructive"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.date_joined)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setEditingUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingUser(user)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterRole !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start by creating your first user"}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (hasPrevious) setCurrentPage(prev => prev - 1)
                      }}
                      disabled={!hasPrevious}
                      className="flex items-center gap-1"
                    >
                      <span>← Previous</span>
                    </Button>
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, Math.ceil((totalCount || 0) / 20)) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const pageNum = startPage + i;
                    const totalPages = Math.ceil((totalCount || 0) / 20);

                    if (pageNum <= totalPages) {
                      return (
                        <PaginationItem key={pageNum}>
                          <Button
                            variant={pageNum === currentPage ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (hasNext) setCurrentPage(prev => prev + 1)
                      }}
                      disabled={!hasNext}
                      className="flex items-center gap-1"
                    >
                      <span>Next →</span>
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_staff"
                  checked={editingUser.is_staff}
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_staff: checked })}
                />
                <Label htmlFor="edit_is_staff">Administrator privileges</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUserMutation.loading}>
              {updateUserMutation.loading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-destructive">
                    {deletingUser.full_name?.charAt(0) || deletingUser.email.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{deletingUser.full_name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{deletingUser.email}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.loading}
            >
              {deleteUserMutation.loading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
