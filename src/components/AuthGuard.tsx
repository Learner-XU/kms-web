"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useKMSStore } from "@/lib/store"

// Paths accessible without login (but won't redirect logged-in users away)
const PUBLIC_VIEW_PATHS = ["/profile/", "/p", "/p/"]
// The homepage "/" is always public (handled separately)
// Paths only for guests — logged-in users get redirected to /app
const GUEST_ONLY_PATHS = ["/login", "/register"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useKMSStore((s) => s.user)
  const authLoading = useKMSStore((s) => s.authLoading)
  const checkAuth = useKMSStore((s) => s.checkAuth)

  useEffect(() => {
    // Skip auth check for public pages — saves ~100-200ms
    const isHomepage = pathname === "/"
    const isPublicView = isHomepage || PUBLIC_VIEW_PATHS.some(p => pathname.startsWith(p))
    const isGuestOnly = GUEST_ONLY_PATHS.some(p => pathname.startsWith(p))
    if (!isPublicView && !isGuestOnly) {
      checkAuth()
    }
  }, [checkAuth, pathname])

  useEffect(() => {
    if (authLoading) return
    const isHomepage = pathname === "/"
    const isPublicView = isHomepage || PUBLIC_VIEW_PATHS.some(p => pathname.startsWith(p))
    const isGuestOnly = GUEST_ONLY_PATHS.some(p => pathname.startsWith(p))
    const isApp = pathname.startsWith("/app")

    if (!user && !isPublicView && !isGuestOnly) {
      router.push("/login")
    } else if (user && isGuestOnly) {
      router.push("/app")
    } else if (!user && isApp) {
      router.push("/login")
    }
  }, [user, authLoading, pathname, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-muted text-sm">加载中...</div>
      </div>
    )
  }

  return <>{children}</>
}
