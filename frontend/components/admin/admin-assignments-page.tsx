"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Users, Target } from "lucide-react"
import { usePaginatedApi, useCreateMutation, useDeleteMutation } from "@/hooks/use-api"
import { apiClient } from "@/lib/api"

interface Assignment {
  id: string
  officer: {
    id: string
    full_name: string
    email: string
  }
  campaign: {
    id: string
    name: string
  }
  created_at: string
}

export function AdminAssignmentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: assignmentsData, isLoading, error, refetch } = usePaginatedApi(() => apiClient.getAssignments(), [])

  const { data: officersData } = usePaginatedApi(() => apiClient.getOfficers(), [])

  const { data: campaignsData } = usePaginatedApi(() => apiClient.getCampaigns(), [])

  const createMutation = useCreateMutation((data: any) => apiClient.createAssignment(data), {
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
    },
  })

  const deleteMutation = useDeleteMutation((id: string) => apiClient.deleteAssignment(id), {
    onSuccess: () => refetch(),
  })

  const assignments = assignmentsData?.results || []
  const officers = officersData?.results || []
  const campaigns = campaignsData?.results || []

  const handleCreateAssignment = (formData: FormData) => {
    const data = {
      officer: formData.get("officer") as string,
      campaign: formData.get("campaign") as string,
    }
    createMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading assignments...</div>
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
    <div className="space-y-6">
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
            </DialogHeader>
            <form action={handleCreateAssignment} className="space-y-4">
              <div>
                <Label htmlFor="officer">Select Officer</Label>
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
                <Label htmlFor="campaign">Select Campaign</Label>
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
                Create Assignment
              </Button>
            </form>
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
            <div className="text-2xl font-bold">{officers.length}</div>
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
          <CardDescription>Officer-Campaign assignments and their details</CardDescription>
        </CardHeader>
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
              {assignments.map((assignment: Assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.officer?.full_name || "Unknown Officer"}</TableCell>
                  <TableCell>{assignment.officer?.email || "No email"}</TableCell>
                  <TableCell>{assignment.campaign?.name || "Unknown Campaign"}</TableCell>
                  <TableCell>{new Date(assignment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(assignment.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
