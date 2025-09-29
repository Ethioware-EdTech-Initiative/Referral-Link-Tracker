"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOfficerStats, useOfficerCampaignStats, useOfficerTimelineStats, useOfficerLinks } from "@/hooks/use-api"
import { formatDate } from "@/lib/api-utils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts"
import { MousePointer, CheckCircle, Users, TrendingUp, Link, Calendar, ExternalLink, Target, Activity, RefreshCw } from "lucide-react"

export function OfficerDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const { data: statsData, loading: statsLoading, error: statsError, refetch: refetchStats } = useOfficerStats()
  const { data: campaignStatsData, loading: campaignLoading, error: campaignError, refetch: refetchCampaigns } = useOfficerCampaignStats()
  const { data: timelineData, loading: timelineLoading, error: timelineError, refetch: refetchTimeline } = useOfficerTimelineStats()
  const { data: linksData, loading: linksLoading, error: linksError, refetch: refetchLinks } = useOfficerLinks()

  // Extract metrics from stats data (must be before useMemo)
  const linksResults = (linksData as any)?.results || (Array.isArray(linksData) ? linksData : [])
  const totalLinks = linksResults?.length || 0
  const activeLinks = linksResults?.filter((link: any) => link.is_active).length || 0
  const totalClicks = linksResults?.reduce((sum: number, link: any) => sum + (link.click_count || 0), 0) || 0
  const totalSignups = linksResults?.reduce((sum: number, link: any) => sum + (link.signup_count || 0), 0) || 0

  // Process timeline data - ensure it's in the correct format
  const processedTimelineData = useMemo(() => {
    if (!timelineData || !Array.isArray(timelineData)) return []

    return timelineData.map((item: any) => ({
      date: item.date || item.timestamp || new Date().toISOString().split('T')[0],
      clicks: item.clicks || item.click_count || 0,
      signups: item.signups || item.signup_count || 0
    }))
  }, [timelineData])

  // Process campaign data - ensure it's in the correct format  
  const processedCampaignData = useMemo(() => {
    if (!campaignStatsData || !Array.isArray(campaignStatsData)) {
      // If no campaign data, generate from links data
      if (linksResults && linksResults.length > 0) {
        const campaignMap = new Map()
        linksResults.forEach((link: any) => {
          const campaignName = link.campaign?.name || 'Unknown Campaign'
          const existing = campaignMap.get(campaignName) || { campaign_name: campaignName, clicks: 0, signups: 0 }
          existing.clicks += link.click_count || 0
          existing.signups += link.signup_count || 0
          campaignMap.set(campaignName, existing)
        })
        return Array.from(campaignMap.values())
      }
      return []
    }

    return campaignStatsData.map((item: any) => ({
      campaign_name: item.campaign_name || item.name || item.campaign?.name || 'Unknown',
      clicks: item.clicks || item.click_count || 0,
      signups: item.signups || item.signup_count || 0
    }))
  }, [campaignStatsData, linksResults])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await Promise.all([
        refetchStats?.(),
        refetchCampaigns?.(),
        refetchTimeline?.(),
        refetchLinks?.()
      ])
      setLastRefresh(new Date())
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [refetchStats, refetchCampaigns, refetchTimeline, refetchLinks])

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchStats?.(),
        refetchCampaigns?.(),
        refetchTimeline?.(),
        refetchLinks?.()
      ])
      setLastRefresh(new Date())
    } finally {
      setIsRefreshing(false)
    }
  }

  const isLoading = statsLoading || campaignLoading || timelineLoading || linksLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const metrics = [
    {
      title: "Total Clicks",
      value: totalClicks,
      icon: MousePointer,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      change: statsData?.click_change || null,
    },
    {
      title: "Total Signups",
      value: totalSignups,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      change: statsData?.signup_change || null,
    },
    {
      title: "Active Links",
      value: activeLinks,
      icon: Link,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      change: null,
    },
    {
      title: "Conversion Rate",
      value: totalClicks > 0 ? `${((totalSignups / totalClicks) * 100).toFixed(1)}%` : "0%",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      change: statsData?.conversion_change || null,
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Last updated: {formatDate(lastRefresh.toISOString())}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                  <p className="text-2xl font-bold">
                    {typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString()}
                  </p>
                  {metric.change && (
                    <p className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change > 0 ? '↗' : '↘'} {Math.abs(metric.change)}% from last week
                    </p>
                  )}
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
        {/* Performance Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Timeline
              {timelineLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2" />}
            </CardTitle>
            <CardDescription>Your activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {timelineLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : processedTimelineData && processedTimelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedTimelineData}>
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
                      formatter={(value: number, name: string) => [value, name === 'clicks' ? 'Clicks' : 'Signups']}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="clicks"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="signups"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="signups"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No timeline data available</p>
                    <p className="text-sm">Performance trends will appear here once you have activity</p>
                  </div>
                </div>
              )}
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
              {linksResults?.slice(0, 5).map((link: any) => (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{link.ref_code}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(link.created_at)}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{link.click_count || 0} clicks</span>
                      <span>{link.signup_count || 0} signups</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={link.is_active ? "default" : "secondary"}>
                      {link.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={link.full_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
              {(!linksResults || linksResults.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No links created yet</p>
                  <p className="text-sm">Contact your administrator to get referral links assigned</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Campaign Performance
            {campaignLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2" />}
          </CardTitle>
          <CardDescription>Performance breakdown by campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {campaignLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : processedCampaignData && processedCampaignData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedCampaignData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="campaign_name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'clicks' ? 'Clicks' : 'Signups'
                    ]}
                  />
                  <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="signups" fill="#10b981" name="Signups" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campaign data available</p>
                  <p className="text-sm">Campaign performance will appear here once you have active links</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                {totalClicks > 0 ? Math.round((totalSignups / totalClicks) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeLinks}
              </div>
              <p className="text-sm text-muted-foreground">Active Links</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totalLinks}
              </div>
              <p className="text-sm text-muted-foreground">Total Links</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error States */}
      {(statsError || campaignError || timelineError || linksError) && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <CheckCircle className="h-5 w-5" />
              <p>Error loading dashboard data: {statsError || campaignError || timelineError || linksError}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
