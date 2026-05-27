import type { Metadata } from "next"
import "./globals.css"
import AuthGuard from "@/components/AuthGuard"

export const metadata: Metadata = {
  title: "Second Brain - Knowledge Management",
  description: "Personal knowledge management system based on Gitea",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}
