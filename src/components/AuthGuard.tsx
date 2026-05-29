"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useKMSStore } from "@/lib/store"

// Paths accessible without login (but won't redirect logged-in users away)
const PUBLIC_VIEW_PATHS = ["/profile/"]
// Paths only for guests — logged-in users get redirected to /
const GUEST_ONLY_PATHS = ["/login", "/register"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useKMSStore((s) => s.user)
  const authLoading = useKMSStore((s) => s.authLoading)
  const checkAuth = useKMSStore((s) => s.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (authLoading) return
    const isPublicView = PUBLIC_VIEW_PATHS.some(p => pathname.startsWith(p))
    const isGuestOnly = GUEST_ONLY_PATHS.some(p => pathname.startsWith(p))
    if (!user && !isPublicView && !isGuestOnly) {
      router.push("/login")
    } else if (user && isGuestOnly) {
      router.push("/")
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
