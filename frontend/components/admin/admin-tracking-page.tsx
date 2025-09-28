"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import {
    Shield,
    MousePointer,
    UserPlus,
    AlertTriangle,
    Eye,
    Search,
    Filter,
    MapPin,
    Calendar,
    Activity,
    TrendingUp,
    Download,
    RefreshCw
} from "lucide-react"

interface ClickEvent {
    id: string
    referral_link: string
    ip: string | null
    user_agent: string | null
    geo_country: string | null
    geo_city: string | null
    geo_region: string | null
    fraud_score: number
    timestamp: string
}

interface SignupEvent {
    id: string
    referral_link: string
    click_event: string
    conversion_minutes: number | null
    fraud_score: number
    timestamp: string
}

interface FraudFinding {
    id: string
    event_type: "click" | "signup"
    event_id: string
    fraud_score: number
    findings_details: string | null
    timestamp: string
}

export function AdminTrackingPage() {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("overview")
    const [isLoading, setIsLoading] = useState(false)

    // Data states
    const [clickEvents, setClickEvents] = useState<ClickEvent[]>([])
    const [signupEvents, setSignupEvents] = useState<SignupEvent[]>([])
    const [fraudFindings, setFraudFindings] = useState<FraudFinding[]>([])

    // Filter states
    const [clickSearchTerm, setClickSearchTerm] = useState("")
    const [signupSearchTerm, setSignupSearchTerm] = useState("")
    const [fraudSearchTerm, setFraudSearchTerm] = useState("")
    const [fraudScoreFilter, setFraudScoreFilter] = useState<"all" | "low" | "medium" | "high">("all")
    const [eventTypeFilter, setEventTypeFilter] = useState<"all" | "click" | "signup">("all")

    // Load data
    useEffect(() => {
        loadTrackingData()
    }, [])

    const loadTrackingData = async () => {
        setIsLoading(true)
        try {
            const [clicksRes, signupsRes, fraudRes] = await Promise.all([
                apiClient.getClickEvents(),
                apiClient.getSignupEvents(),
                apiClient.getFraudFindings()
            ])

            if (clicksRes.data) {
                setClickEvents(clicksRes.data.results || clicksRes.data)
            }
            if (signupsRes.data) {
                setSignupEvents(signupsRes.data.results || signupsRes.data)
            }
            if (fraudRes.data) {
                setFraudFindings(fraudRes.data.results || fraudRes.data)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load tracking data",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate overview metrics
    const overviewMetrics = [
        {
            title: "Total Clicks",
            value: clickEvents.length,
            icon: MousePointer,
            bgColor: "bg-blue-100 dark:bg-blue-900",
            iconColor: "text-blue-600 dark:text-blue-300",
        },
        {
            title: "Total Signups",
            value: signupEvents.length,
            icon: UserPlus,
            bgColor: "bg-green-100 dark:bg-green-900",
            iconColor: "text-green-600 dark:text-green-300",
        },
        {
            title: "Fraud Findings",
            value: fraudFindings.length,
            icon: AlertTriangle,
            bgColor: "bg-red-100 dark:bg-red-900",
            iconColor: "text-red-600 dark:text-red-300",
        },
        {
            title: "Avg Conversion Rate",
            value: clickEvents.length > 0 ? `${((signupEvents.length / clickEvents.length) * 100).toFixed(1)}%` : "0%",
            icon: TrendingUp,
            bgColor: "bg-purple-100 dark:bg-purple-900",
            iconColor: "text-purple-600 dark:text-purple-300",
        },
    ]

    // Filter functions
    const filteredClickEvents = clickEvents.filter(event => {
        if (!clickSearchTerm) return true
        return (
            event.ip?.toLowerCase().includes(clickSearchTerm.toLowerCase()) ||
            event.geo_country?.toLowerCase().includes(clickSearchTerm.toLowerCase()) ||
            event.geo_city?.toLowerCase().includes(clickSearchTerm.toLowerCase())
        )
    })

    const filteredSignupEvents = signupEvents.filter(event => {
        if (!signupSearchTerm) return true
        return event.id.toLowerCase().includes(signupSearchTerm.toLowerCase())
    })

    const filteredFraudFindings = fraudFindings.filter(finding => {
        let matchesSearch = true
        let matchesScore = true
        let matchesType = true

        if (fraudSearchTerm) {
            matchesSearch =
                finding.event_id.toLowerCase().includes(fraudSearchTerm.toLowerCase()) ||
                finding.findings_details?.toLowerCase().includes(fraudSearchTerm.toLowerCase())
        }

        if (fraudScoreFilter !== "all") {
            const score = finding.fraud_score
            if (fraudScoreFilter === "low") matchesScore = score < 0.3
            else if (fraudScoreFilter === "medium") matchesScore = score >= 0.3 && score < 0.7
            else if (fraudScoreFilter === "high") matchesScore = score >= 0.7
        }

        if (eventTypeFilter !== "all") {
            matchesType = finding.event_type === eventTypeFilter
        }

        return matchesSearch && matchesScore && matchesType
    })

    const getFraudScoreColor = (score: number) => {
        if (score < 0.3) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        if (score < 0.7) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }

    const getFraudScoreLabel = (score: number) => {
        if (score < 0.3) return "Low Risk"
        if (score < 0.7) return "Medium Risk"
        return "High Risk"
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8" />
                        Tracking & Security
                    </h1>
                    <p className="text-muted-foreground">Monitor clicks, signups, and fraud detection across all campaigns.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadTrackingData} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="clicks" className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4" />
                        Click Events
                    </TabsTrigger>
                    <TabsTrigger value="signups" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Signup Events
                    </TabsTrigger>
                    <TabsTrigger value="fraud" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Fraud Detection
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {overviewMetrics.map((metric) => (
                            <Card key={metric.title}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                                            <p className="text-2xl font-bold">{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-full ${metric.bgColor}`}>
                                            <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Recent High-Risk Findings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Recent High-Risk Findings
                            </CardTitle>
                            <CardDescription>Latest fraud detections requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {fraudFindings.filter(f => f.fraud_score >= 0.7).slice(0, 5).length > 0 ? (
                                <div className="space-y-3">
                                    {fraudFindings.filter(f => f.fraud_score >= 0.7).slice(0, 5).map((finding) => (
                                        <div key={finding.id} className="flex items-center justify-between p-3 border rounded">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="destructive">High Risk</Badge>
                                                <div>
                                                    <p className="font-medium">{finding.event_type.toUpperCase()} Event</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Score: {(finding.fraud_score * 100).toFixed(1)}% | {new Date(finding.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => setActiveTab("fraud")}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert>
                                    <Shield className="h-4 w-4" />
                                    <AlertDescription>No high-risk fraud findings detected recently.</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Click Events Tab */}
                <TabsContent value="clicks" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <MousePointer className="h-5 w-5" />
                                    Click Events ({clickEvents.length})
                                </span>
                            </CardTitle>
                            <CardDescription>All recorded click events across referral links</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by IP, country, or city..."
                                        value={clickSearchTerm}
                                        onChange={(e) => setClickSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>IP Address</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Fraud Score</TableHead>
                                            <TableHead>User Agent</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredClickEvents.slice(0, 50).map((click) => (
                                            <TableRow key={click.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(click.timestamp).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="bg-muted px-2 py-1 rounded text-sm">
                                                        {click.ip || "Unknown"}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {[click.geo_city, click.geo_region, click.geo_country].filter(Boolean).join(", ") || "Unknown"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getFraudScoreColor(click.fraud_score)}>
                                                        {(click.fraud_score * 100).toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                                                        {click.user_agent || "Unknown"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {filteredClickEvents.length > 50 && (
                                <div className="text-center py-4">
                                    <Badge variant="outline">Showing first 50 of {filteredClickEvents.length} results</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Signup Events Tab */}
                <TabsContent value="signups" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Signup Events ({signupEvents.length})
                            </CardTitle>
                            <CardDescription>Successful conversions from clicks to signups</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search signup events..."
                                        value={signupSearchTerm}
                                        onChange={(e) => setSignupSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Referral Link</TableHead>
                                            <TableHead>Click Event</TableHead>
                                            <TableHead>Conversion Time</TableHead>
                                            <TableHead>Fraud Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSignupEvents.slice(0, 50).map((signup) => (
                                            <TableRow key={signup.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(signup.timestamp).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="bg-muted px-2 py-1 rounded text-xs">
                                                        {signup.referral_link.substring(0, 8)}...
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="bg-muted px-2 py-1 rounded text-xs">
                                                        {signup.click_event.substring(0, 8)}...
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {signup.conversion_minutes ? `${signup.conversion_minutes} min` : "Immediate"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getFraudScoreColor(signup.fraud_score)}>
                                                        {(signup.fraud_score * 100).toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {filteredSignupEvents.length > 50 && (
                                <div className="text-center py-4">
                                    <Badge variant="outline">Showing first 50 of {filteredSignupEvents.length} results</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Fraud Detection Tab */}
                <TabsContent value="fraud" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Fraud Detection Results ({fraudFindings.length})
                            </CardTitle>
                            <CardDescription>Automated fraud detection findings and risk assessments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search fraud findings..."
                                        value={fraudSearchTerm}
                                        onChange={(e) => setFraudSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={fraudScoreFilter} onValueChange={(value: any) => setFraudScoreFilter(value)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Risk Levels</SelectItem>
                                        <SelectItem value="low">Low Risk</SelectItem>
                                        <SelectItem value="medium">Medium Risk</SelectItem>
                                        <SelectItem value="high">High Risk</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={eventTypeFilter} onValueChange={(value: any) => setEventTypeFilter(value)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Event Types</SelectItem>
                                        <SelectItem value="click">Click Events</SelectItem>
                                        <SelectItem value="signup">Signup Events</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Event Type</TableHead>
                                            <TableHead>Event ID</TableHead>
                                            <TableHead>Risk Level</TableHead>
                                            <TableHead>Findings</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFraudFindings.slice(0, 50).map((finding) => (
                                            <TableRow key={finding.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(finding.timestamp).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {finding.event_type.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="bg-muted px-2 py-1 rounded text-xs">
                                                        {finding.event_id.substring(0, 8)}...
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getFraudScoreColor(finding.fraud_score)}>
                                                        {getFraudScoreLabel(finding.fraud_score)} ({(finding.fraud_score * 100).toFixed(1)}%)
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {finding.findings_details || "No additional details"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {filteredFraudFindings.length > 50 && (
                                <div className="text-center py-4">
                                    <Badge variant="outline">Showing first 50 of {filteredFraudFindings.length} results</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}