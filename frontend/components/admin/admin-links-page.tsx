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
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react"
import { useAdminLinks, useCampaigns, useOfficers, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks/use-api"
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
  const [editingLink, setEditingLink] = useState<AdminLink | null>(null)

  const { data: linksData, loading, error, refetch } = useAdminLinks()

  const { data: campaignsData } = useCampaigns()
  const { data: officersData } = useOfficers()

  const createMutation = useCreateMutation((data: any) => apiClient.createLink(data), {
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
    },
  })

  // Note: Link updates not supported by backend - referral links are immutable

  const deleteMutation = useDeleteMutation((id: string) => apiClient.deleteLink(id), {
    onSuccess: () => refetch(),
  })

  const links = linksData || []
  const campaigns = campaignsData || []
  const officers = officersData || []

  const filteredLinks = links.filter(
    (link: AdminLink) =>
      link.full_link?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.officer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateLink = (formData: FormData) => {
    const data = {
      officer: formData.get("officer") as string,
      campaign: formData.get("campaign") as string,
    }
    createMutation.mutate(data)
  }

  // Note: Link updates not supported - referral links are immutable after creation

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
                      <Button variant="outline" size="sm" onClick={() => setEditingLink(link)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(link.id)}>
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
      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Details</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <div className="space-y-4">
              <div>
                <Label>Full Link</Label>
                <Input value={editingLink.full_link} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Reference Code</Label>
                <Input value={editingLink.ref_code} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Officer</Label>
                <Input value={editingLink.officer?.full_name || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Campaign</Label>
                <Input value={editingLink.campaign?.name || 'N/A'} readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={editingLink.is_active ? "default" : "secondary"} className="mt-2">
                  {editingLink.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <Label>Created</Label>
                <Input value={new Date(editingLink.created_at).toLocaleString()} readOnly className="bg-gray-50" />
              </div>
              <Button
                onClick={() => setEditingLink(null)}
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
