"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useKMSStore } from "@/lib/store"

const PUBLIC_PATHS = ["/login", "/register"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, authLoading, checkAuth } = useKMSStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (authLoading) return
    const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
    if (!user && !isPublic) {
      router.push("/login")
    } else if (user && isPublic) {
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
