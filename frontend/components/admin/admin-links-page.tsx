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
import { useAdminLinks, useCampaigns, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks/use-api"
import { apiClient } from "@/lib/api"

interface AdminLink {
  id: string
  url: string
  campaign: {
    id: string
    name: string
  }
  is_verified: boolean
  created_at: string
  click_count?: number
}

export function AdminLinksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<AdminLink | null>(null)

  const { data: linksData, loading, error, refetch } = useAdminLinks()

  const { data: campaignsData } = useCampaigns()

  const createMutation = useCreateMutation((data: any) => apiClient.createLink(data), {
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
    },
  })

  const updateMutation = useUpdateMutation(
    (data: { id: string; [key: string]: any }) => apiClient.updateLink(data.id, data),
    {
      onSuccess: () => {
        refetch()
        setEditingLink(null)
      },
    },
  )

  const deleteMutation = useDeleteMutation((id: string) => apiClient.deleteLink(id), {
    onSuccess: () => refetch(),
  })

  const links = linksData || []
  const campaigns = campaignsData || []

  const filteredLinks = links.filter(
    (link: AdminLink) =>
      link.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateLink = (formData: FormData) => {
    const data = {
      url: formData.get("url") as string,
      campaign: formData.get("campaign") as string,
      is_verified: formData.get("is_verified") === "on",
    }
    createMutation.mutate(data)
  }

  const handleUpdateLink = (formData: FormData) => {
    if (!editingLink) return
    const data = {
      id: editingLink.id,
      url: formData.get("url") as string,
      campaign: formData.get("campaign") as string,
      is_verified: formData.get("is_verified") === "on",
    }
    updateMutation.mutate(data)
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
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" type="url" placeholder="https://example.com" required />
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
              <div className="flex items-center space-x-2">
                <Switch id="is_verified" name="is_verified" />
                <Label htmlFor="is_verified">Verified Link</Label>
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
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline max-w-xs truncate"
                      >
                        {link.url}
                      </a>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </TableCell>
                  <TableCell>{link.campaign?.name || "No Campaign"}</TableCell>
                  <TableCell>
                    <Badge variant={link.is_verified ? "default" : "secondary"}>
                      {link.is_verified ? "Verified" : "Unverified"}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <form action={handleUpdateLink} className="space-y-4">
              <div>
                <Label htmlFor="edit_url">URL</Label>
                <Input id="edit_url" name="url" type="url" defaultValue={editingLink.url} required />
              </div>
              <div>
                <Label htmlFor="edit_campaign">Campaign</Label>
                <Select name="campaign" defaultValue={editingLink.campaign?.id} required>
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
              <div className="flex items-center space-x-2">
                <Switch id="edit_is_verified" name="is_verified" defaultChecked={editingLink.is_verified} />
                <Label htmlFor="edit_is_verified">Verified Link</Label>
              </div>
              <Button type="submit" className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black">
                Update Link
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
