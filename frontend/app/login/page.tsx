"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const { resolvedTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Geometric pattern background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 relative overflow-hidden">
        {/* Geometric patterns */}
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="geometric" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0L80 40L40 80L0 40Z" fill="none" stroke="rgba(0, 255, 136, 0.2)" strokeWidth="1" />
                <path
                  d="M20 20L60 20L60 60L20 60L20 20Z"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.15)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geometric)" />
          </svg>

          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-20 w-16 h-16 border-2 border-[#00ff88]/30 rotate-45"></div>
          <div className="absolute top-40 right-32 w-12 h-12 border-2 border-blue-400/30 rotate-12"></div>
          <div className="absolute bottom-32 left-16 w-20 h-20 border-2 border-[#00ff88]/20 -rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-14 h-14 border-2 border-cyan-400/25 rotate-45"></div>
        </div>

        {/* Content - Centered */}
        <div className="relative z-10 flex flex-col items-center justify-center px-12 text-white text-center w-full">
          <img
            src={resolvedTheme === 'dark' ? '/alx-logo.png' : '/alx-logo-black.png'}
            alt="ALX Logo"
            className="h-16 mb-6 mx-auto"
          />
          <h1 className="text-4xl font-bold mb-4">Recruitment Tracker</h1>
          <p className="text-lg text-slate-300 mb-6">
            Welcome back!<br />
            This is the Recruitment Tracker Portal, your gateway to managing recruitment campaigns and tracking referral performance.
          </p>
          <div className="space-y-3 text-slate-400">
            <p>If you already have an account, log in using your email and password.</p>
            <p>Contact your administrator if you need access or have forgotten your credentials.</p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-4 right-4">
          <ThemeToggleSimple />
        </div>

        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mb-4 lg:hidden">
                <img
                  src={resolvedTheme === 'dark' ? '/alx-logo.png' : '/alx-logo-black.png'}
                  alt="ALX Logo"
                  className="h-8 mx-auto mb-4"
                />
              </div>
              <CardTitle className="text-2xl font-bold">Sign In To Your Account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access the recruitment tracker
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember" className="rounded border-gray-300" />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>
                  <Button variant="link" className="px-0 text-sm text-primary">
                    Forgot password?
                  </Button>
                </div>

                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Need help accessing your account?</p>
                <Button variant="link" className="px-0 text-sm">
                  Contact Administrator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
