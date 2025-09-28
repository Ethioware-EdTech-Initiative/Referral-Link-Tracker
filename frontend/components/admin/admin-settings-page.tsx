"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import {
    Eye,
    EyeOff,
    User,
    Lock,
    Mail,
    Settings,
    Shield,
    Bell,
    Globe,
    Users,
    Target,
    Save,
    RotateCcw
} from "lucide-react"

export function AdminSettingsPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("profile")

    // Password form state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    // System settings state
    const [systemSettings, setSystemSettings] = useState({
        siteName: "ALX Recruitment Tracker",
        siteDescription: "Track and manage recruitment campaigns and referral performance",
        allowUserRegistration: false,
        requireEmailVerification: true,
        defaultUserRole: "officer",
        maxCampaignsPerOfficer: 5,
        linkExpirationDays: 365,
        enableFraudDetection: true,
        autoAssignOfficers: false
    })

    // Notification settings state
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        dailyReports: true,
        weeklyReports: true,
        fraudAlerts: true,
        systemUpdates: false,
        newUserRegistrations: true,
        campaignExpiring: true,
        lowPerformanceAlerts: false
    })

    // Security settings state
    const [securitySettings, setSecuritySettings] = useState({
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireSpecialCharacters: true,
        forcePasswordReset: false,
        enableTwoFactor: false,
        ipWhitelisting: false,
        auditLogging: true
    })

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords don't match",
                variant: "destructive",
            })
            return
        }

        if (passwordForm.newPassword.length < securitySettings.passwordMinLength) {
            toast({
                title: "Error",
                description: `Password must be at least ${securitySettings.passwordMinLength} characters long`,
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await apiClient.changePassword(passwordForm.currentPassword, passwordForm.newPassword)

            if (response.data) {
                toast({
                    title: "Success",
                    description: "Password changed successfully",
                })
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                })
            } else {
                toast({
                    title: "Error",
                    description: response.error || "Failed to change password",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while changing password",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveSettings = async (settingsType: string, settings: any) => {
        setIsSaving(true)
        try {
            // Note: These would be actual API calls in a real implementation
            // For now, we'll just simulate the save operation

            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

            toast({
                title: "Settings Saved",
                description: `${settingsType} settings have been updated successfully`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to save ${settingsType.toLowerCase()} settings`,
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const resetToDefaults = (settingsType: string) => {
        switch (settingsType) {
            case 'system':
                setSystemSettings({
                    siteName: "ALX Recruitment Tracker",
                    siteDescription: "Track and manage recruitment campaigns and referral performance",
                    allowUserRegistration: false,
                    requireEmailVerification: true,
                    defaultUserRole: "officer",
                    maxCampaignsPerOfficer: 5,
                    linkExpirationDays: 365,
                    enableFraudDetection: true,
                    autoAssignOfficers: false
                })
                break
            case 'notifications':
                setNotificationSettings({
                    emailNotifications: true,
                    dailyReports: true,
                    weeklyReports: true,
                    fraudAlerts: true,
                    systemUpdates: false,
                    newUserRegistrations: true,
                    campaignExpiring: true,
                    lowPerformanceAlerts: false
                })
                break
            case 'security':
                setSecuritySettings({
                    sessionTimeout: 24,
                    maxLoginAttempts: 5,
                    passwordMinLength: 8,
                    requireSpecialCharacters: true,
                    forcePasswordReset: false,
                    enableTwoFactor: false,
                    ipWhitelisting: false,
                    auditLogging: true
                })
                break
        }

        toast({
            title: "Settings Reset",
            description: `${settingsType} settings have been reset to defaults`,
        })
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
                <p className="text-muted-foreground">Manage system settings, security, and your account preferences.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        System
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Advanced
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Administrator Profile
                            </CardTitle>
                            <CardDescription>Your account details and administrative information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" value={user?.email || ""} disabled className="pl-10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" value={user?.full_name || ""} disabled placeholder="Not set" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <div className="pt-1">
                                        <Badge variant="default" className="bg-blue-600">
                                            {user?.is_staff ? "System Administrator" : "Officer"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="pt-1">
                                        <Badge variant={user?.is_active ? "default" : "secondary"}>
                                            {user?.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Member Since</Label>
                                    <Input
                                        value={user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : "Unknown"}
                                        disabled
                                    />
                                </div>
                            </div>

                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                    As a system administrator, you have full access to all system features and user data.
                                    Contact your system administrator to modify profile information.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>Update your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                                    {isLoading ? "Changing Password..." : "Change Password"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    System Configuration
                                </CardTitle>
                                <CardDescription>Configure global system settings and defaults.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetToDefaults('system')}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset to Defaults
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('System', systemSettings)}
                                    disabled={isSaving}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save Settings"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={systemSettings.siteName}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="defaultUserRole">Default User Role</Label>
                                    <Select
                                        value={systemSettings.defaultUserRole}
                                        onValueChange={(value) => setSystemSettings({ ...systemSettings, defaultUserRole: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="officer">Officer</SelectItem>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">Site Description</Label>
                                <Textarea
                                    id="siteDescription"
                                    value={systemSettings.siteDescription}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, siteDescription: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxCampaigns">Max Campaigns per Officer</Label>
                                    <Input
                                        id="maxCampaigns"
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={systemSettings.maxCampaignsPerOfficer}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, maxCampaignsPerOfficer: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkExpiration">Link Expiration (Days)</Label>
                                    <Input
                                        id="linkExpiration"
                                        type="number"
                                        min="1"
                                        max="3650"
                                        value={systemSettings.linkExpirationDays}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, linkExpirationDays: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    User Management Settings
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Allow User Registration</Label>
                                            <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                                        </div>
                                        <Switch
                                            checked={systemSettings.allowUserRegistration}
                                            onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, allowUserRegistration: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Require Email Verification</Label>
                                            <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                                        </div>
                                        <Switch
                                            checked={systemSettings.requireEmailVerification}
                                            onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, requireEmailVerification: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Auto-assign Officers to Campaigns</Label>
                                            <p className="text-sm text-muted-foreground">Automatically assign new officers to active campaigns</p>
                                        </div>
                                        <Switch
                                            checked={systemSettings.autoAssignOfficers}
                                            onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoAssignOfficers: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Fraud Detection</Label>
                                            <p className="text-sm text-muted-foreground">Enable automated fraud detection for clicks and signups</p>
                                        </div>
                                        <Switch
                                            checked={systemSettings.enableFraudDetection}
                                            onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableFraudDetection: checked })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Security Settings
                                </CardTitle>
                                <CardDescription>Configure security policies and authentication settings.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetToDefaults('security')}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset to Defaults
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('Security', securitySettings)}
                                    disabled={isSaving}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save Settings"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sessionTimeout">Session Timeout (Hours)</Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        min="1"
                                        max="168"
                                        value={securitySettings.sessionTimeout}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                    <Input
                                        id="maxLoginAttempts"
                                        type="number"
                                        min="3"
                                        max="10"
                                        value={securitySettings.maxLoginAttempts}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                                    <Input
                                        id="passwordMinLength"
                                        type="number"
                                        min="6"
                                        max="32"
                                        value={securitySettings.passwordMinLength}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Authentication Policies
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Require Special Characters in Passwords</Label>
                                            <p className="text-sm text-muted-foreground">Enforce special characters in user passwords</p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.requireSpecialCharacters}
                                            onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireSpecialCharacters: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Force Password Reset on Next Login</Label>
                                            <p className="text-sm text-muted-foreground">Require all users to reset passwords on next login</p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.forcePasswordReset}
                                            onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, forcePasswordReset: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Two-Factor Authentication</Label>
                                            <p className="text-sm text-muted-foreground">Require 2FA for all user accounts (coming soon)</p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.enableTwoFactor}
                                            onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })}
                                            disabled
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>IP Whitelisting</Label>
                                            <p className="text-sm text-muted-foreground">Restrict access to whitelisted IP addresses (coming soon)</p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.ipWhitelisting}
                                            onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, ipWhitelisting: checked })}
                                            disabled
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Audit Logging</Label>
                                            <p className="text-sm text-muted-foreground">Log all administrative actions and user activities</p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.auditLogging}
                                            onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, auditLogging: checked })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Settings
                                </CardTitle>
                                <CardDescription>Configure email notifications and system alerts.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetToDefaults('notifications')}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset to Defaults
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('Notification', notificationSettings)}
                                    disabled={isSaving}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save Settings"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Notifications
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Master switch for all email notifications</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.emailNotifications}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Daily Performance Reports</Label>
                                            <p className="text-sm text-muted-foreground">Receive daily campaign performance summaries</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.dailyReports}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, dailyReports: checked })}
                                            disabled={!notificationSettings.emailNotifications}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Weekly Performance Reports</Label>
                                            <p className="text-sm text-muted-foreground">Receive weekly campaign performance summaries</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.weeklyReports}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReports: checked })}
                                            disabled={!notificationSettings.emailNotifications}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>New User Registrations</Label>
                                            <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.newUserRegistrations}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newUserRegistrations: checked })}
                                            disabled={!notificationSettings.emailNotifications}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Campaign Expiring Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Get notified when campaigns are about to expire</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.campaignExpiring}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, campaignExpiring: checked })}
                                            disabled={!notificationSettings.emailNotifications}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    System Alerts
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Fraud Detection Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Get notified of potential fraudulent activities</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.fraudAlerts}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, fraudAlerts: checked })}
                                            disabled={!notificationSettings.emailNotifications}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>System Updates</Label>
                                            <p className="text-sm text-muted-foreground">Get notified of system updates and maintenance</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.systemUpdates}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemUpdates: checked })}
                                            disabled={!notificationSettings.emailNotifications}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Low Performance Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Get notified of campaigns with low performance</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings.lowPerformanceAlerts}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowPerformanceAlerts: checked })}
                                            disabled={!notificationSettings.emailNotifications}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Advanced Settings
                            </CardTitle>
                            <CardDescription>Advanced system configurations and maintenance options.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                    These settings affect core system functionality. Please proceed with caution.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">System Maintenance</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" className="justify-start">
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Clear Application Cache
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Rebuild Search Index
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <Target className="h-4 w-4 mr-2" />
                                        Recalculate Metrics
                                    </Button>
                                    <Button variant="outline" className="justify-start" disabled>
                                        <Globe className="h-4 w-4 mr-2" />
                                        Export System Data (Coming Soon)
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Danger Zone</h4>
                                <div className="space-y-2">
                                    <Button variant="destructive" disabled>
                                        Reset All Settings to Defaults
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        This will reset all system settings to their default values. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}