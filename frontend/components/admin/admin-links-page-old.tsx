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
import { Plus, Edit, Trash2, ExternalLink, Search, Copy, Eye } from "lucide-react"
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
  created_at: string
}

export function AdminLinksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewingLink, setViewingLink] = useState<AdminLink | null>(null)
  const [deletingLink, setDeletingLink] = useState<AdminLink | null>(null)
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

  const handleDeleteLink = () => {
    if (!deletingLink) return
    deleteMutation.mutate(deletingLink.id)
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading links...</div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Link Management</h1>
          <p className="text-muted-foreground">Manage referral links and their verification status</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] hover:bg-[#00e67a] text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Link</DialogTitle>
            </DialogHeader>
            <form action={handleCreateLink} className="space-y-4">
              <div>
                <Label htmlFor="officer">Officer</Label>
                <Select name="officer" required>
                  <SelectTrigger>
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
              </div>
              <div>
                <Label htmlFor="campaign">Campaign</Label>
                <Select name="campaign" required>
                  <SelectTrigger>
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
              </div>
              <Button type="submit" className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black">
                Create Link
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Links</CardTitle>
          <CardDescription>Find links by URL or campaign name</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Links ({filteredLinks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link: AdminLink) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <a
                        href={link.full_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline max-w-xs truncate"
                      >
                        {link.full_link}
                      </a>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </TableCell>
                  <TableCell>{link.campaign?.name || "No Campaign"}</TableCell>
                  <TableCell>
                    <Badge variant={link.is_active ? "default" : "secondary"}>
                      {link.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{link.click_count || 0}</TableCell>
                  <TableCell>{new Date(link.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingLink(link)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDeletingLink(link)}
                        className="text-red-600 hover:text-red-700"
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

      {/* View Dialog */}
      <Dialog open={!!viewingLink} onOpenChange={() => setViewingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Details</DialogTitle>
          </DialogHeader>
          {viewingLink && (
            <div className="space-y-4">
              <div>
                <Label>Full Link</Label>
                <Input value={viewingLink.full_link} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Reference Code</Label>
                <Input value={viewingLink.ref_code} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Officer</Label>
                <Input value={viewingLink.officer?.full_name || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Campaign</Label>
                <Input value={viewingLink.campaign?.name || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={viewingLink.is_active ? "default" : "secondary"} className="mt-2">
                  {viewingLink.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <Label>Created</Label>
                <Input value={new Date(viewingLink.created_at).toLocaleString()} readOnly className="bg-gray-50" />
              </div>
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
    </div>
  )
}
