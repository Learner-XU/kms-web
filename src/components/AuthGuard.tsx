"use client"

import { useEffect, useMemo } from "react"
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

  const isPublic = useMemo(() => {
    if (pathname === "/") return true
    return PUBLIC_VIEW_PATHS.some(p => pathname.startsWith(p))
  }, [pathname])

  const isGuestOnly = useMemo(() => {
    return GUEST_ONLY_PATHS.some(p => pathname.startsWith(p))
  }, [pathname])

  useEffect(() => {
    // Skip auth check for public pages — saves ~100-200ms
    if (!isPublic && !isGuestOnly) {
      checkAuth()
    }
  }, [checkAuth, isPublic, isGuestOnly])

  useEffect(() => {
    if (authLoading) return
    const isApp = pathname.startsWith("/app")

    if (!user && !isPublic && !isGuestOnly) {
      router.push("/login")
    } else if (user && isGuestOnly) {
      router.push("/app")
    } else if (!user && isApp) {
      router.push("/login")
    }
  }, [user, authLoading, pathname, router, isPublic, isGuestOnly])

  // Public pages render immediately — no auth wait
  if (authLoading && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-muted text-sm">加载中...</div>
      </div>
    )
  }

  return <>{children}</>
}
