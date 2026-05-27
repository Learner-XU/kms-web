"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useKMSStore } from "@/lib/store"
import { Brain } from "@phosphor-icons/react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useKMSStore()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(username, password)
      router.push("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-[340px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center mx-auto mb-4">
            <Brain weight="fill" className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">Second Brain</h1>
          <p className="text-[13px] text-text-muted mt-1">登录你的知识库</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-[13px] text-danger px-3 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] text-text-ghost mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-ghost outline-none focus:border-border-accent transition-colors"
              placeholder="输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-ghost mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-ghost outline-none focus:border-border-accent transition-colors"
              placeholder="输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>

          <p className="text-center text-xs text-text-ghost">
            还没有账户？{" "}
            <Link href="/register" className="text-accent hover:text-accent-hover transition-colors">
              注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
