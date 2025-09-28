"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Eye, Trash2, ExternalLink, Search, Copy, Link, Calendar, CheckSquare, Square } from "lucide-react"
import { useAdminLinks, useAllCampaigns, useAllOfficers, useCreateMutation, useDeleteMutation } from "@/hooks/use-api"
import { apiClient } from "@/lib/api"

interface AdminLink {
  id: string
  full_link: string
  ref_code: string
  officer: {
    id: string
    full_name: string
    email: string
  }
  campaign: {
    id: string
    name: string
  }
  click_count: number
  signup_count: number
  is_active: boolean
  revoke_at?: string | null
  created_at: string
  updated_at?: string
}

export function AdminLinksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewingLink, setViewingLink] = useState<AdminLink | null>(null)

  const [deletingLink, setDeletingLink] = useState<AdminLink | null>(null)
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [newLink, setNewLink] = useState({
    officer: "",
    campaign: "",
  })

  const { data: linksData, loading, error, refetch } = useAdminLinks()
  const { data: campaignsData } = useAllCampaigns()
  const { data: officersData } = useAllOfficers()

  const createMutation = useCreateMutation((data: any) => apiClient.createLink(data), {
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
      setNewLink({ officer: "", campaign: "" })
      setFormErrors({})
    },
    onError: (error: string) => {
      console.log('[CREATE ERROR]', error)
      try {
        const errorObj = JSON.parse(error)
        if (errorObj.officer) {
          setFormErrors({ officer: errorObj.officer[0] })
        } else if (errorObj.campaign) {
          setFormErrors({ campaign: errorObj.campaign[0] })
        } else if (errorObj.non_field_errors) {
          setFormErrors({ general: errorObj.non_field_errors[0] })
        } else {
          setFormErrors({ general: error || "Failed to create link" })
        }
      } catch (e) {
        setFormErrors({ general: error || "Failed to create link" })
      }
    },
  })

  const updateMutation = useUpdateMutation(
    (data: { id: string;[key: string]: any }) => apiClient.updateLink(data.id, { is_active: data.is_active, revoke_at: data.revoke_at }),
    {
      onSuccess: () => {
        refetch()
        setEditingLink(null)
        setFormErrors({})
      },
      onError: (error: string) => {
        console.log('[UPDATE ERROR]', error)
        try {
          const errorObj = JSON.parse(error)
          if (errorObj.is_active) {
            setFormErrors({ general: errorObj.is_active[0] })
          } else if (errorObj.revoke_at) {
            setFormErrors({ general: errorObj.revoke_at[0] })
          } else {
            setFormErrors({ general: error || "Failed to update link" })
          }
        } catch (e) {
          setFormErrors({ general: error || "Update not supported - links are immutable after creation" })
        }
      },
    }
  )

  const deleteMutation = useDeleteMutation((id: string) => apiClient.deleteLink(id), {
    onSuccess: () => {
      refetch()
      setDeletingLink(null)
    },
    onError: (error: string) => {
      console.log('[DELETE ERROR]', error)
      setDeletingLink(null)
    },
  })

  const links = linksData || []
  const campaigns = campaignsData || []
  const officers = officersData || []

  const filteredLinks = links.filter(
    (link: AdminLink) =>
      link.full_link?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.ref_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.officer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.officer?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateLink = () => {
    const errors: { [key: string]: string } = {}

    // Form validation
    if (!newLink.officer) errors.officer = "Officer is required"
    if (!newLink.campaign) errors.campaign = "Campaign is required"

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const data = {
      officer: newLink.officer,
      campaign: newLink.campaign,
    }

    createMutation.mutate(data)
  }

  const handleUpdateLink = () => {
    if (!editingLink) return

    const errors: { [key: string]: string } = {}

    // Basic validation for revoke_at
    if (editingLink.revoke_at && new Date(editingLink.revoke_at) <= new Date()) {
      errors.revoke_at = "Revocation date must be in the future"
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const updateData: any = {
      id: editingLink.id,
      is_active: editingLink.is_active,
    }

    if (editingLink.revoke_at) {
      updateData.revoke_at = new Date(editingLink.revoke_at).toISOString()
    } else {
      updateData.revoke_at = null
    }

    updateMutation.mutate(updateData)
  }

  const handleDeleteLink = () => {
    if (!deletingLink) return
    deleteMutation.mutate(deletingLink.id)
  }

  const handleBulkDelete = () => {
    if (selectedLinks.size === 0) return
    // For now, delete them one by one - could be optimized with bulk endpoint if available
    selectedLinks.forEach(linkId => {
      deleteMutation.mutate(linkId)
    })
    setSelectedLinks(new Set())
  }

  const handleBulkToggleStatus = (active: boolean) => {
    if (selectedLinks.size === 0) return
    // For now, update them one by one - could be optimized with bulk endpoint if available
    selectedLinks.forEach(linkId => {
      const link = links.find((l: AdminLink) => l.id === linkId)
      if (link) {
        updateMutation.mutate({ id: linkId, is_active: active })
      }
    })
    setSelectedLinks(new Set())
  }

  const toggleLinkSelection = (linkId: string) => {
    const newSelection = new Set(selectedLinks)
    if (newSelection.has(linkId)) {
      newSelection.delete(linkId)
    } else {
      newSelection.add(linkId)
    }
    setSelectedLinks(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedLinks.size === filteredLinks.length) {
      setSelectedLinks(new Set())
    } else {
      setSelectedLinks(new Set(filteredLinks.map((link: AdminLink) => link.id)))
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You might want to add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
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
        <div className="text-lg text-red-500">Error loading links: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Link Management</h1>
          <p className="text-muted-foreground">Manage referral links and track their performance</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] hover:bg-[#00e67a] text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Referral Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {formErrors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="officer">
                  Officer <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newLink.officer}
                  onValueChange={(value) => {
                    setNewLink({ ...newLink, officer: value })
                    if (formErrors.officer) {
                      setFormErrors({ ...formErrors, officer: "" })
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.officer ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select an officer" />
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
                  <p className="text-sm text-red-500">{formErrors.officer}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign">
                  Campaign <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newLink.campaign}
                  onValueChange={(value) => {
                    setNewLink({ ...newLink, campaign: value })
                    if (formErrors.campaign) {
                      setFormErrors({ ...formErrors, campaign: "" })
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.campaign ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a campaign" />
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
                  <p className="text-sm text-red-500">{formErrors.campaign}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setNewLink({ officer: "", campaign: "" })
                    setFormErrors({})
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateLink}
                  disabled={createMutation.isLoading}
                  className="flex-1 bg-[#00ff88] hover:bg-[#00e67a] text-black"
                >
                  {createMutation.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  ) : (
                    "Create Link"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Links
          </CardTitle>
          <CardDescription>
            Find links by URL, reference code, officer name, or campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Referral Links ({filteredLinks.length})
              </CardTitle>
              <CardDescription>
                All generated referral links with performance metrics
              </CardDescription>
            </div>

            {selectedLinks.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedLinks.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleStatus(true)}
                  className="text-green-600"
                >
                  <Power className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleStatus(false)}
                  className="text-orange-600"
                >
                  <Power className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedLinks.size})
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="h-6 w-6 p-0"
                    >
                      {selectedLinks.size === filteredLinks.length && filteredLinks.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Link & Code</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status & Expiry</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No links found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((link: AdminLink) => (
                    <TableRow key={link.id} className={selectedLinks.has(link.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLinkSelection(link.id)}
                          className="h-6 w-6 p-0"
                        >
                          {selectedLinks.has(link.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={link.full_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium text-sm max-w-[200px] truncate block"
                            >
                              {link.full_link}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(link.full_link)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Code: {link.ref_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{link.officer?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{link.officer?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{link.campaign?.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{link.click_count || 0}</span> clicks
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{link.signup_count || 0}</span> signups
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={link.is_active ? "default" : "secondary"}>
                            {link.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {link.revoke_at && (
                            <div className="text-xs text-orange-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires: {new Date(link.revoke_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(link.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingLink(link)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingLink({ ...link })}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingLink(link)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Link Details Dialog */}
      <Dialog open={!!viewingLink} onOpenChange={() => setViewingLink(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link Details</DialogTitle>
          </DialogHeader>
          {viewingLink && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Link</Label>
                <div className="flex items-center gap-2">
                  <Input value={viewingLink.full_link} readOnly className="bg-muted" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(viewingLink.full_link)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reference Code</Label>
                <Input value={viewingLink.ref_code} readOnly className="bg-muted font-mono" />
              </div>

              <div className="space-y-2">
                <Label>Officer</Label>
                <Input value={`${viewingLink.officer?.full_name} (${viewingLink.officer?.email})`} readOnly className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>Campaign</Label>
                <Input value={viewingLink.campaign?.name || 'N/A'} readOnly className="bg-muted" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clicks</Label>
                  <Input value={viewingLink.click_count || 0} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Signups</Label>
                  <Input value={viewingLink.signup_count || 0} readOnly className="bg-muted" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="pt-1">
                  <Badge variant={viewingLink.is_active ? "default" : "secondary"}>
                    {viewingLink.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Created</Label>
                  <Input value={new Date(viewingLink.created_at).toLocaleString()} readOnly className="bg-muted" />
                </div>
                {viewingLink.updated_at && (
                  <div className="space-y-2">
                    <Label>Updated</Label>
                    <Input value={new Date(viewingLink.updated_at).toLocaleString()} readOnly className="bg-muted" />
                  </div>
                )}
              </div>

              {viewingLink.revoke_at && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-orange-600">
                    <Calendar className="h-4 w-4" />
                    Revocation Date
                  </Label>
                  <Input value={new Date(viewingLink.revoke_at).toLocaleString()} readOnly className="bg-muted border-orange-200" />
                  <p className="text-xs text-orange-600">
                    This link will be automatically deactivated on the above date
                  </p>
                </div>
              )}

              <Button
                onClick={() => setViewingLink(null)}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={!!editingLink} onOpenChange={() => {
        setEditingLink(null)
        setFormErrors({})
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Referral Link</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <div className="space-y-4">
              {formErrors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Full Link (Read-only)</Label>
                <Input value={editingLink.full_link} readOnly className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>Reference Code (Read-only)</Label>
                <Input value={editingLink.ref_code} readOnly className="bg-muted font-mono" />
              </div>

              <div className="space-y-2">
                <Label>Officer (Read-only)</Label>
                <Input value={`${editingLink.officer?.full_name} (${editingLink.officer?.email})`} readOnly className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>Campaign (Read-only)</Label>
                <Input value={editingLink.campaign?.name || 'N/A'} readOnly className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Power className="h-4 w-4" />
                  Link Status
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingLink.is_active}
                    onCheckedChange={(checked) => setEditingLink({ ...editingLink, is_active: checked })}
                  />
                  <span className="text-sm font-medium">
                    {editingLink.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Revocation Date (Optional)
                </Label>
                <Input
                  type="datetime-local"
                  value={editingLink.revoke_at ? new Date(editingLink.revoke_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingLink({ ...editingLink, revoke_at: e.target.value ? e.target.value : null })}
                  className={formErrors.revoke_at ? "border-red-500" : ""}
                />
                {formErrors.revoke_at && (
                  <p className="text-sm text-red-500">{formErrors.revoke_at}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Set a future date to automatically deactivate this link
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingLink(null)
                    setFormErrors({})
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateLink}
                  disabled={updateMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateMutation.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    "Update Link"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLink} onOpenChange={() => setDeletingLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Referral Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this referral link? This action cannot be undone.
              <br /><br />
              <strong>Link:</strong> {deletingLink?.full_link}
              <br />
              <strong>Officer:</strong> {deletingLink?.officer?.full_name}
              <br />
              <strong>Campaign:</strong> {deletingLink?.campaign?.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingLink(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLink}
              disabled={deleteMutation.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Delete Link"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}