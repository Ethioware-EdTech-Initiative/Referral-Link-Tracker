"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOfficerClicks, useOfficerLinks } from "@/hooks/use-api"
import { formatDate } from "@/lib/api-utils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { MousePointer, CheckCircle, XCircle, TrendingUp, Link, Calendar, ExternalLink } from "lucide-react"

export function OfficerDashboard() {
  const { data: clicksData, loading: clicksLoading, error: clicksError } = useOfficerClicks()
  const { data: linksData, loading: linksLoading, error: linksError } = useOfficerLinks()

  if (clicksLoading || linksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const metrics = [
    {
      title: "Total Clicks",
      value: clicksData?.total_clicks || 0,
      icon: MousePointer,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Verified Clicks",
      value: clicksData?.verified_clicks || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Unverified Clicks",
      value: clicksData?.unverified_clicks || 0,
      icon: XCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Active Links",
      value: linksData?.length || 0,
      icon: Link,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Officer Dashboard</h1>
          <p className="text-muted-foreground">Track your referral performance and manage your links</p>
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
              Weekly Click Trends
            </CardTitle>
            <CardDescription>Your click performance over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clicksData?.weekly_clicks || []}>
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
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Recent Links
            </CardTitle>
            <CardDescription>Your most recently created referral links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {linksData?.slice(0, 5).map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{link.url}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(link.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={link.is_verified ? "default" : "secondary"}>
                      {link.is_verified ? "Verified" : "Pending"}
                    </Badge>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
              {(!linksData || linksData.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No links created yet</p>
                  <p className="text-sm">Start creating referral links to track your performance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Overview of your referral activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {clicksData?.total_clicks
                  ? Math.round((clicksData.verified_clicks / clicksData.total_clicks) * 100)
                  : 0}
                %
              </div>
              <p className="text-sm text-muted-foreground">Verification Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {linksData?.filter((link) => link.is_verified).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Verified Links</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {clicksData?.weekly_clicks?.reduce((sum, day) => sum + day.clicks, 0) || 0}
              </div>
              <p className="text-sm text-muted-foreground">This Week's Clicks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error States */}
      {(clicksError || linksError) && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <p>Error loading dashboard data: {clicksError || linksError}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
