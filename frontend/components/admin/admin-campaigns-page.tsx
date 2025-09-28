"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import { useCampaigns, useCreateMutation, useUpdateMutation, useDeleteMutation } from "@/hooks/use-api"
import { apiClient } from "@/lib/api"

interface Campaign {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export function AdminCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  const { data: campaignsData, loading, error, refetch } = useCampaigns()

  const createMutation = useCreateMutation((data: any) => apiClient.createCampaign(data), {
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
    },
  })

  const updateMutation = useUpdateMutation(
    (data: { id: string;[key: string]: any }) => apiClient.updateCampaign(data.id, data),
    {
      onSuccess: () => {
        refetch()
        setEditingCampaign(null)
      },
    },
  )

  const deleteMutation = useDeleteMutation((id: string) => apiClient.deleteCampaign(id), {
    onSuccess: () => refetch(),
  })

  const campaigns = campaignsData || []

  const filteredCampaigns = campaigns.filter(
    (campaign: Campaign) =>
      campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateCampaign = (formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      is_active: formData.get("is_active") === "on",
    }
    createMutation.mutate(data)
  }

  const handleUpdateCampaign = (formData: FormData) => {
    if (!editingCampaign) return
    const data = {
      id: editingCampaign.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      is_active: formData.get("is_active") === "on",
    }
    updateMutation.mutate(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading campaigns...</div>
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
    <div className="space-y-6">
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
            </DialogHeader>
            <form action={handleCreateCampaign} className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" name="start_date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" name="end_date" type="date" required />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_active" name="is_active" />
                <Label htmlFor="is_active">Active Campaign</Label>
              </div>
              <Button type="submit" className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black">
                Create Campaign
              </Button>
            </form>
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
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{campaign.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                      {new Date(campaign.end_date).toLocaleDateString()}
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
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(campaign.id)}>
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
          </DialogHeader>
          {editingCampaign && (
            <form action={handleUpdateCampaign} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Campaign Name</Label>
                <Input id="edit_name" name="name" defaultValue={editingCampaign.name} required />
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  name="description"
                  defaultValue={editingCampaign.description}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_start_date">Start Date</Label>
                  <Input
                    id="edit_start_date"
                    name="start_date"
                    type="date"
                    defaultValue={editingCampaign.start_date?.split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_end_date">End Date</Label>
                  <Input
                    id="edit_end_date"
                    name="end_date"
                    type="date"
                    defaultValue={editingCampaign.end_date?.split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit_is_active" name="is_active" defaultChecked={editingCampaign.is_active} />
                <Label htmlFor="edit_is_active">Active Campaign</Label>
              </div>
              <Button type="submit" className="w-full bg-[#00ff88] hover:bg-[#00e67a] text-black">
                Update Campaign
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
