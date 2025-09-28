"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Users, Target, Calendar, Edit } from "lucide-react"
import { useTheme } from "next-themes"
import { useAssignments, useAllOfficers, useAllCampaigns, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks/use-api"
import { apiClient } from "@/lib/api"

interface Assignment {
  id: string
  officer: string  // UUID of the officer
  campaign: string  // UUID of the campaign
  assigned_at: string | null
}

export function AdminAssignmentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [newAssignment, setNewAssignment] = useState({
    officer: "",
    campaign: "",
  })
  const [editAssignment, setEditAssignment] = useState({
    officer: "",
    campaign: "",
  })

  const { data: assignmentsData, loading, error, refetch } = useAssignments()
  const { data: officersData } = useAllOfficers()
  const { data: campaignsData } = useAllCampaigns()

  const createMutation = useCreateMutation((data: any) => apiClient.createAssignment(data), {
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
      setFormErrors({})
      setNewAssignment({
        officer: "",
        campaign: "",
      })
    },
    onError: (error: string) => {
      setFormErrors({ general: error || "Failed to create assignment" })
    },
  })

  const updateMutation = useUpdateMutation((data: any) => apiClient.updateAssignment(data.id, data), {
    onSuccess: () => {
      refetch()
      setEditingAssignment(null)
      setFormErrors({})
      setEditAssignment({
        officer: "",
        campaign: "",
      })
    },
    onError: (error: string) => {
      setFormErrors({ general: error || "Failed to update assignment" })
    },
  })

  const deleteMutation = useDeleteMutation((id: string) => apiClient.deleteAssignment(id), {
    onSuccess: async () => {
      setDeletingAssignment(null)
      await refetch()
    },
    onError: (error: string) => {
      setFormErrors({ general: error || "Failed to delete assignment" })
    },
  })

  const assignments = assignmentsData || []
  const officers = officersData || []
  const campaigns = campaignsData || []

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    if (!searchTerm) return true

    const officer = officers.find((o: any) => o.id === assignment.officer)
    const campaign = campaigns.find((c: any) => c.id === assignment.campaign)

    const officerName = officer?.full_name || ""
    const officerEmail = officer?.email || ""
    const campaignName = campaign?.name || ""

    return (
      officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaignName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleCreateAssignment = () => {
    const errors: { [key: string]: string } = {}

    // Form validation
    if (!newAssignment.officer.trim()) errors.officer = "Officer selection is required"
    if (!newAssignment.campaign.trim()) errors.campaign = "Campaign selection is required"

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const data = {
      officer: newAssignment.officer,
      campaign: newAssignment.campaign,
    }

    createMutation.mutate(data)
  }

  const handleUpdateAssignment = () => {
    const errors: { [key: string]: string } = {}

    // Form validation
    if (!editAssignment.officer.trim()) errors.officer = "Officer selection is required"
    if (!editAssignment.campaign.trim()) errors.campaign = "Campaign selection is required"

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const data = {
      id: editingAssignment?.id,
      officer: editAssignment.officer,
      campaign: editAssignment.campaign,
    }

    updateMutation.mutate(data)
  }

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setEditAssignment({
      officer: assignment.officer,
      campaign: assignment.campaign,
    })
    setFormErrors({})
  }

  const handleDeleteAssignment = () => {
    if (!deletingAssignment) return
    deleteMutation.mutate(deletingAssignment.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading assignments: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignment Management</h1>
          <p className="text-muted-foreground">Assign officers to recruitment campaigns</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] hover:bg-[#00e67a] text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>Assign an officer to a recruitment campaign</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="officer">Officer <span className="text-red-500">*</span></Label>
                <Select
                  value={newAssignment.officer}
                  onValueChange={(value) => {
                    setNewAssignment(prev => ({ ...prev, officer: value }))
                    if (formErrors.officer) {
                      setFormErrors(prev => ({ ...prev, officer: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.officer ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose an officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map((officer: any) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.full_name} ({officer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.officer && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.officer}</p>
                )}
              </div>
              <div>
                <Label htmlFor="campaign">Campaign <span className="text-red-500">*</span></Label>
                <Select
                  value={newAssignment.campaign}
                  onValueChange={(value) => {
                    setNewAssignment(prev => ({ ...prev, campaign: value }))
                    if (formErrors.campaign) {
                      setFormErrors(prev => ({ ...prev, campaign: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.campaign ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.campaign && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.campaign}</p>
                )}
              </div>
              {formErrors.general && (
                <div className="text-red-500 text-sm">{formErrors.general}</div>
              )}
              <Button onClick={handleCreateAssignment} className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Assignment Dialog */}
        <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
              <DialogDescription>Update the officer-campaign assignment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-officer">Officer <span className="text-red-500">*</span></Label>
                <Select
                  value={editAssignment.officer}
                  onValueChange={(value) => {
                    setEditAssignment(prev => ({ ...prev, officer: value }))
                    if (formErrors.officer) {
                      setFormErrors(prev => ({ ...prev, officer: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.officer ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose an officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map((officer: any) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.full_name} ({officer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.officer && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.officer}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-campaign">Campaign <span className="text-red-500">*</span></Label>
                <Select
                  value={editAssignment.campaign}
                  onValueChange={(value) => {
                    setEditAssignment(prev => ({ ...prev, campaign: value }))
                    if (formErrors.campaign) {
                      setFormErrors(prev => ({ ...prev, campaign: "" }))
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.campaign ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.campaign && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.campaign}</p>
                )}
              </div>
              {formErrors.general && (
                <div className="text-red-500 text-sm">{formErrors.general}</div>
              )}
              <Button onClick={handleUpdateAssignment} className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black" disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Assignment"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officers.filter((o: any) => o.is_active !== false).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.filter((c: any) => c.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments ({assignments.length})</CardTitle>
          <CardDescription>Officer-Campaign assignments and their details{searchTerm && ` (${filteredAssignments.length} shown)`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search assignments by officer name, email, or campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div></CardContent>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment: Assignment) => {
                const officer = officers.find((o: any) => o.id === assignment.officer)
                const campaign = campaigns.find((c: any) => c.id === assignment.campaign)

                return (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {officer?.full_name || "Unknown Officer"}
                    </TableCell>
                    <TableCell>{officer?.email || "No email"}</TableCell>
                    <TableCell>{campaign?.name || "Unknown Campaign"}</TableCell>
                    <TableCell>
                      {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : "No date"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(assignment)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingAssignment(assignment)}
                          disabled={deleteMutation.isLoading}
                        >
                          {deleteMutation.isLoading ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAssignment} onOpenChange={() => setDeletingAssignment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const officer = officers.find((o: any) => o.id === deletingAssignment?.officer)
                const campaign = campaigns.find((c: any) => c.id === deletingAssignment?.campaign)
                return (
                  <>
                    Are you sure you want to delete the assignment for{" "}
                    <strong>
                      {officer?.full_name || "Unknown Officer"}
                    </strong>{" "}
                    to campaign{" "}
                    <strong>{campaign?.name || "Unknown Campaign"}</strong>?
                    <br />
                    <br />
                    This action cannot be undone.
                  </>
                )
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssignment}
              disabled={deleteMutation.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Assignment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
