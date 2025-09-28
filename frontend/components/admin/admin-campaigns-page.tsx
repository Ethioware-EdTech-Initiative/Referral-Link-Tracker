"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import { useCampaigns, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks/use-api"
import { apiClient } from "@/lib/api"

interface Campaign {
  id: string
  name: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

export function AdminCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: false,
  })

  const { data: campaignsData, loading, error, refetch } = useCampaigns()

  const createMutation = useCreateMutation((data: any) => apiClient.createCampaign(data), {
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
      setFormErrors({})
      setNewCampaign({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        is_active: false,
      })
    },
    onError: (error: string) => {
      setFormErrors({ general: error || "Failed to create campaign" })
    },
  })

  const updateMutation = useUpdateMutation(
    (data: { id: string;[key: string]: any }) => apiClient.updateCampaign(data.id, data),
    {
      onSuccess: () => {
        refetch()
        setEditingCampaign(null)
        setFormErrors({})
      },
      onError: (error: string) => {
        setFormErrors({ general: error || "Failed to update campaign" })
      },
    },
  )

  const deleteMutation = useDeleteMutation((id: string) => apiClient.deleteCampaign(id), {
    onSuccess: async (result) => {
      console.log('[DELETE DEBUG] Delete successful, result:', result)
      setDeletingCampaign(null)
      console.log('[DELETE DEBUG] Modal closed, attempting refetch...')
      try {
        await refetch()
        console.log('[DELETE DEBUG] Refetch completed successfully')
      } catch (error) {
        console.error('[DELETE DEBUG] Refetch failed:', error)
        // Fallback to page reload if refetch fails
        window.location.reload()
      }
    },
    onError: (error: string) => {
      console.error('[DELETE DEBUG] Delete failed:', error)
      // Keep the modal open if deletion fails so user can try again
      setFormErrors({ general: error || "Failed to delete campaign" })
    },
  })

  const campaigns = campaignsData || []

  const filteredCampaigns = campaigns.filter(
    (campaign: Campaign) =>
      campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateCampaign = () => {
    const errors: { [key: string]: string } = {}

    // Form validation
    if (!newCampaign.name.trim()) errors.name = "Campaign name is required"
    if (!newCampaign.start_date) errors.start_date = "Start date is required"
    if (!newCampaign.end_date) errors.end_date = "End date is required"

    if (newCampaign.start_date && newCampaign.end_date && new Date(newCampaign.start_date) >= new Date(newCampaign.end_date)) {
      errors.end_date = "End date must be after start date"
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const data = {
      name: newCampaign.name.trim(),
      description: newCampaign.description.trim() || null, // Send null for empty descriptions as per API spec
      start_date: newCampaign.start_date ? new Date(newCampaign.start_date).toISOString() : newCampaign.start_date,
      end_date: newCampaign.end_date ? new Date(newCampaign.end_date).toISOString() : newCampaign.end_date,
      is_active: newCampaign.is_active,
    }

    createMutation.mutate(data)
  }

  const handleUpdateCampaign = () => {
    if (!editingCampaign) return

    const errors: { [key: string]: string } = {}

    // Form validation
    if (!editingCampaign.name || !editingCampaign.name.trim()) errors.name = "Campaign name is required"
    if (!editingCampaign.start_date) errors.start_date = "Start date is required"
    if (!editingCampaign.end_date) errors.end_date = "End date is required"

    if (editingCampaign.start_date && editingCampaign.end_date && new Date(editingCampaign.start_date) >= new Date(editingCampaign.end_date)) {
      errors.end_date = "End date must be after start date"
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const data = {
      name: (editingCampaign.name || "").trim(),
      description: (editingCampaign.description || "").trim() || null, // Send null for empty descriptions as per API spec
      start_date: editingCampaign.start_date ? new Date(editingCampaign.start_date).toISOString() : editingCampaign.start_date,
      end_date: editingCampaign.end_date ? new Date(editingCampaign.end_date).toISOString() : editingCampaign.end_date,
      is_active: editingCampaign.is_active,
    }

    const dataWithId = { id: editingCampaign.id, ...data }
    console.log('[PATCH DEBUG] Sending data:', dataWithId)
    console.log('[PATCH DEBUG] Original campaign:', editingCampaign)
    updateMutation.mutate(dataWithId)
  }

  const handleDeleteCampaign = () => {
    if (!deletingCampaign) return
    console.log('[DELETE DEBUG] Starting delete for campaign:', deletingCampaign.id)
    deleteMutation.mutate(deletingCampaign.id)
    // Don't set deletingCampaign to null here - let the onSuccess callback handle it
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
        <div className="text-lg text-red-500">Error loading campaigns: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground">Manage recruitment campaigns and their settings</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] hover:bg-[#00e67a] text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Add a new recruitment campaign to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {formErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  {formErrors.general}
                </div>
              )}
              <div>
                <Label htmlFor="name" className="flex items-center gap-1">
                  Campaign Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => {
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                    if (formErrors.name) {
                      const newErrors = { ...formErrors }
                      delete newErrors.name
                      setFormErrors(newErrors)
                    }
                  }}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => {
                    setNewCampaign({ ...newCampaign, description: e.target.value })
                    if (formErrors.description) {
                      const newErrors = { ...formErrors }
                      delete newErrors.description
                      setFormErrors(newErrors)
                    }
                  }}
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="flex items-center gap-1">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) => {
                      setNewCampaign({ ...newCampaign, start_date: e.target.value })
                      if (formErrors.start_date) {
                        const newErrors = { ...formErrors }
                        delete newErrors.start_date
                        setFormErrors(newErrors)
                      }
                    }}
                    className={formErrors.start_date ? "border-red-500" : ""}
                  />
                  {formErrors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.start_date}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end_date" className="flex items-center gap-1">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) => {
                      setNewCampaign({ ...newCampaign, end_date: e.target.value })
                      if (formErrors.end_date) {
                        const newErrors = { ...formErrors }
                        delete newErrors.end_date
                        setFormErrors(newErrors)
                      }
                    }}
                    className={formErrors.end_date ? "border-red-500" : ""}
                  />
                  {formErrors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.end_date}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newCampaign.is_active}
                  onCheckedChange={(checked) => setNewCampaign({ ...newCampaign, is_active: checked })}
                />
                <Label htmlFor="is_active">Active Campaign</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setFormErrors({})
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCampaign}
                  disabled={createMutation.isLoading}
                  className="flex-1 bg-[#00ff88] hover:bg-[#00e67a] text-black"
                >
                  {createMutation.isLoading ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Campaigns</CardTitle>
          <CardDescription>Find campaigns by name or description</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign: Campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name || "Untitled"}</TableCell>
                  <TableCell className="max-w-xs truncate">{campaign.description || "No description"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : "No start date"} -{" "}
                      {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : "No end date"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={campaign.is_active ? "default" : "secondary"}>
                      {campaign.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingCampaign(campaign)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingCampaign(campaign)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign information and settings</DialogDescription>
          </DialogHeader>
          {editingCampaign && (
            <div className="space-y-4">
              {formErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  {formErrors.general}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_name" className="flex items-center gap-1">
                    Campaign Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_name"
                    value={editingCampaign.name || ""}
                    onChange={(e) => {
                      setEditingCampaign({ ...editingCampaign, name: e.target.value })
                      if (formErrors.name) {
                        const newErrors = { ...formErrors }
                        delete newErrors.name
                        setFormErrors(newErrors)
                      }
                    }}
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                    id="edit_description"
                    value={editingCampaign.description || ""}
                    onChange={(e) => {
                      setEditingCampaign({ ...editingCampaign, description: e.target.value })
                      if (formErrors.description) {
                        const newErrors = { ...formErrors }
                        delete newErrors.description
                        setFormErrors(newErrors)
                      }
                    }}
                    className={formErrors.description ? "border-red-500" : ""}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_start_date" className="flex items-center gap-1">
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit_start_date"
                      type="date"
                      value={(editingCampaign.start_date || "").split("T")[0] || ""}
                      onChange={(e) => {
                        setEditingCampaign({ ...editingCampaign, start_date: e.target.value })
                        if (formErrors.start_date) {
                          const newErrors = { ...formErrors }
                          delete newErrors.start_date
                          setFormErrors(newErrors)
                        }
                      }}
                      className={formErrors.start_date ? "border-red-500" : ""}
                    />
                    {formErrors.start_date && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.start_date}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edit_end_date" className="flex items-center gap-1">
                      End Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit_end_date"
                      type="date"
                      value={(editingCampaign.end_date || "").split("T")[0] || ""}
                      onChange={(e) => {
                        setEditingCampaign({ ...editingCampaign, end_date: e.target.value })
                        if (formErrors.end_date) {
                          const newErrors = { ...formErrors }
                          delete newErrors.end_date
                          setFormErrors(newErrors)
                        }
                      }}
                      className={formErrors.end_date ? "border-red-500" : ""}
                    />
                    {formErrors.end_date && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.end_date}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_active"
                    checked={editingCampaign.is_active}
                    onCheckedChange={(checked) => setEditingCampaign({ ...editingCampaign, is_active: checked })}
                  />
                  <Label htmlFor="edit_is_active">Active Campaign</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingCampaign(null)
                    setFormErrors({})
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateCampaign}
                  disabled={updateMutation.isLoading}
                  className="flex-1 bg-[#00ff88] hover:bg-[#00e67a] text-black"
                >
                  {updateMutation.isLoading ? "Updating..." : "Update Campaign"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCampaign} onOpenChange={() => setDeletingCampaign(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Campaign</DialogTitle>
            <DialogDescription>This action cannot be undone</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this campaign? This action cannot be undone.
            </p>
            {deletingCampaign && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium">{deletingCampaign.name || "Untitled Campaign"}</div>
                <div className="text-sm text-muted-foreground">{deletingCampaign.description || "No description"}</div>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {deletingCampaign.start_date ? new Date(deletingCampaign.start_date).toLocaleDateString() : "No start date"} - {deletingCampaign.end_date ? new Date(deletingCampaign.end_date).toLocaleDateString() : "No end date"}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingCampaign(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCampaign}
              disabled={deleteMutation.isLoading}
              className="flex-1"
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete Campaign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
