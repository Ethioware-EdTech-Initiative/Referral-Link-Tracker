import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: {
    default: "ALX Ethiopia - Recruitment Tracker Portal",
    template: "%s | ALX Ethiopia Recruitment Tracker"
  },
  description: "ALX Ethiopia's comprehensive recruitment tracking system for managing referral campaigns, monitoring officer performance, and tracking recruitment metrics. Streamline your recruitment process with real-time analytics and campaign management.",
  keywords: [
    "ALX Ethiopia",
    "recruitment tracker",
    "referral system",
    "campaign management",
    "recruitment analytics",
    "performance tracking",
    "ALX ET",
    "recruitment portal"
  ],
  authors: [
    {
      name: "ALX Ethiopia",
      url: "https://alx.com"
    }
  ],
  creator: "ALX Ethiopia",
  publisher: "ALX Ethiopia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://referral-link-tracker.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "ALX Ethiopia - Recruitment Tracker Portal",
    description: "Comprehensive recruitment tracking system for managing referral campaigns and monitoring performance with real-time analytics.",
    url: 'https://referral-link-tracker.vercel.app',
    siteName: 'ALX Ethiopia Recruitment Tracker',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/alx-logo.png',
        width: 1400,
        height: 530,
        alt: 'ALX Ethiopia Recruitment Tracker',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ALX Ethiopia - Recruitment Tracker Portal',
    description: 'Comprehensive recruitment tracking system for managing referral campaigns and monitoring performance.',
    images: ['/alx-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code', // Replace with actual verification code when available
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthProvider>{children}</AuthProvider>
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
