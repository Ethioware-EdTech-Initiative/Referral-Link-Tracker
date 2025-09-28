"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdminMetrics, useAdminStats } from "@/hooks/use-api"
import { formatDate } from "@/lib/api-utils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts"
import {
  MousePointer,
  CheckCircle,
  Users,
  Megaphone,
  TrendingUp,
  Calendar,
  Activity,
  UserCheck,
  Link,
} from "lucide-react"

export function AdminDashboard() {
  const { data: metricsData, loading: metricsLoading, error: metricsError } = useAdminMetrics()
  const { data: statsData, loading: statsLoading, error: statsError } = useAdminStats()

  if (metricsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const metrics = [
    {
      title: "Total Clicks",
      value: metricsData?.total_clicks || 0,
      icon: MousePointer,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      change: "+12%",
    },
    {
      title: "Active Links",
      value: metricsData?.verified_links || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      change: "+8%",
    },
    {
      title: "Active Officers",
      value: metricsData?.officers || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      change: "+3%",
    },
    {
      title: "Campaigns",
      value: metricsData?.campaigns || 0,
      icon: Megaphone,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      change: "+5%",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management controls</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(new Date().toISOString())}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {metric.change}
                  </Badge>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Clicks Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Click Trends
            </CardTitle>
            <CardDescription>System-wide click performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {statsData?.weekly_clicks && statsData.weekly_clicks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statsData.weekly_clicks}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value: number) => [value, "Clicks"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No click data available</p>
                    <p className="text-sm">Data will appear as users interact with links</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Officer Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Officer Performance
            </CardTitle>
            <CardDescription>Top performing officers by click count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {statsData?.officer_activity && statsData.officer_activity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.officer_activity.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="officer" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value, "Clicks"]} />
                    <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No officer activity data</p>
                    <p className="text-sm">Activity will show as officers generate clicks</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Users</h3>
                <p className="text-sm text-muted-foreground">Add, edit, or remove users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-950">
                <Megaphone className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Campaigns</h3>
                <p className="text-sm text-muted-foreground">Create and manage campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-950">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Assignments</h3>
                <p className="text-sm text-muted-foreground">Assign officers to campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-950">
                <Link className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Links</h3>
                <p className="text-sm text-muted-foreground">Monitor and verify links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${metricsError || statsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <div>
                <p className="font-medium">API Status</p>
                <p className="text-sm text-muted-foreground">
                  {metricsError || statsError ? 'Connection issues detected' : 'All systems operational'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${metricsLoading || statsLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <div>
                <p className="font-medium">Data Loading</p>
                <p className="text-sm text-muted-foreground">
                  {metricsLoading || statsLoading ? 'Loading dashboard data...' : 'Data synchronized'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Backend Integration</p>
                <p className="text-sm text-muted-foreground">
                  Connected to referral-link-tracker.vercel.app
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>      {/* Error States */}
      {(metricsError || statsError) && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <Activity className="h-5 w-5" />
              <p>Error loading dashboard data: {metricsError || statsError}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
