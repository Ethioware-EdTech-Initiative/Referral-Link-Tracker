"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

  // Create mutation with form validation
  const createMutation = useCreateMutation((data: any) => apiClient.createLink(data), {
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
      setFormErrors({})
      setNewLink({
        officer: "",
        campaign: "",
      })
    },
    onError: (error: string) => {
      setFormErrors({ general: error || "Failed to create link" })
    },
  })

  // Delete mutation with optimistic updates
  const deleteMutation = useDeleteMutation((id: string) => apiClient.deleteLink(id), {
    onSuccess: () => {
      setDeletingLink(null)
      refetch()
    },
    onError: (error: string) => {
      setFormErrors({ general: error || "Failed to delete link" })
    },
  })

  const links = linksData || []
  const campaigns = campaignsData || []
  const officers = officersData || []

  // Filter links based on search term
  const filteredLinks = links.filter((link: AdminLink) => {
    if (!searchTerm) return true

    return (
      link.officer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.officer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.ref_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.full_link?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleCreateLink = () => {
    const errors: { [key: string]: string } = {}

    // Form validation
    if (!newLink.officer.trim()) errors.officer = "Officer selection is required"
    if (!newLink.campaign.trim()) errors.campaign = "Campaign selection is required"

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const data = {
      officer: newLink.officer,
      campaign: newLink.campaign,
    }

    createMutation.mutate(data)
  }

  const handleDeleteLink = () => {
    if (!deletingLink?.id) return
    deleteMutation.mutate(deletingLink.id)
  }

  const handleBulkDelete = () => {
    if (selectedLinks.size === 0) return

    // Delete selected links one by one
    selectedLinks.forEach(linkId => {
      deleteMutation.mutate(linkId)
    })
    setSelectedLinks(new Set())
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLinks(new Set(filteredLinks.map((link: AdminLink) => link.id)))
    } else {
      setSelectedLinks(new Set())
    }
  }

  const handleSelectLink = (linkId: string, checked: boolean) => {
    const newSelected = new Set(selectedLinks)
    if (checked) {
      newSelected.add(linkId)
    } else {
      newSelected.delete(linkId)
    }
    setSelectedLinks(newSelected)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isExpiringSoon = (link: AdminLink) => {
    if (!link.revoke_at) return false
    const revokeDate = new Date(link.revoke_at)
    const now = new Date()
    const daysDiff = Math.ceil((revokeDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
    return daysDiff <= 7 && daysDiff > 0
  }

  const isExpired = (link: AdminLink) => {
    if (!link.revoke_at) return false
    return new Date(link.revoke_at) <= new Date()
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
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Failed to load links: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Links</h1>
          <p className="text-muted-foreground">Manage all referral links across campaigns and officers.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Generate New Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Referral Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {formErrors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="officer">Officer</Label>
                <Select value={newLink.officer} onValueChange={(value) => setNewLink({ ...newLink, officer: value })}>
                  <SelectTrigger>
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
                {formErrors.officer && <p className="text-red-500 text-sm">{formErrors.officer}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign</Label>
                <Select value={newLink.campaign} onValueChange={(value) => setNewLink({ ...newLink, campaign: value })}>
                  <SelectTrigger>
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
                {formErrors.campaign && <p className="text-red-500 text-sm">{formErrors.campaign}</p>}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLink} disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? "Generating..." : "Generate Link"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.filter((l: AdminLink) => l.is_active && !isExpired(l)).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <ExternalLink className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.reduce((sum: number, l: AdminLink) => sum + (l.click_count || 0), 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <ExternalLink className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.reduce((sum: number, l: AdminLink) => sum + (l.signup_count || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Referral Links ({links.length})</CardTitle>
              <CardDescription>Manage and monitor all generated referral links{searchTerm && ` (${filteredLinks.length} shown)`}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedLinks.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteMutation.isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedLinks.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search links by officer, campaign, or ref code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedLinks.size === filteredLinks.length && filteredLinks.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Ref Code</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link: AdminLink) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedLinks.has(link.id)}
                        onChange={(e) => handleSelectLink(link.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{link.officer?.full_name || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{link.officer?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{link.campaign?.name || "Unknown Campaign"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {link.ref_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(link.ref_code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-4">
                          <span>{link.click_count || 0} clicks</span>
                          <span>{link.signup_count || 0} signups</span>
                        </div>
                        <div className="text-muted-foreground">
                          {link.click_count > 0
                            ? `${((link.signup_count || 0) / link.click_count * 100).toFixed(1)}% conversion`
                            : "No data"
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isExpired(link) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : isExpiringSoon(link) ? (
                          <Badge variant="secondary">Expiring Soon</Badge>
                        ) : link.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {link.revoke_at && (
                          <div className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(link.revoke_at)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(link.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingLink(link)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingLink(link)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLinks.length === 0 && (
            <div className="text-center py-8">
              <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No links match your search." : "No referral links found."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Link Dialog */}
      {viewingLink && (
        <Dialog open={!!viewingLink} onOpenChange={() => setViewingLink(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Link Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Officer</Label>
                  <Input value={`${viewingLink.officer?.full_name} (${viewingLink.officer?.email})`} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Campaign</Label>
                  <Input value={viewingLink.campaign?.name || 'N/A'} readOnly className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Click Count</Label>
                  <Input value={viewingLink.click_count || 0} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Signup Count</Label>
                  <Input value={viewingLink.signup_count || 0} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Conversion Rate</Label>
                  <Input
                    value={viewingLink.click_count > 0
                      ? `${((viewingLink.signup_count || 0) / viewingLink.click_count * 100).toFixed(2)}%`
                      : "0%"
                    }
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="pt-2">
                    {isExpired(viewingLink) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : isExpiringSoon(viewingLink) ? (
                      <Badge variant="secondary">Expiring Soon</Badge>
                    ) : viewingLink.is_active ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Created Date</Label>
                  <Input value={formatDate(viewingLink.created_at)} readOnly className="bg-muted" />
                </div>
              </div>

              {viewingLink.revoke_at && (
                <div className="space-y-2">
                  <Label>Revocation Date</Label>
                  <Input value={formatDate(viewingLink.revoke_at)} readOnly className="bg-muted" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLink} onOpenChange={() => setDeletingLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the referral link for <strong>{deletingLink?.officer?.full_name}</strong> in campaign <strong>{deletingLink?.campaign?.name}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isLoading ? "Deleting..." : "Delete Link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}