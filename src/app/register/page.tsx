"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useKMSStore } from "@/lib/store"
import { Brain } from "@phosphor-icons/react"

export default function RegisterPage() {
  const router = useRouter()
  const register = useKMSStore((s) => s.register)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register(username, email, password, nickname || undefined)
      router.push("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "注册失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-[340px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center mx-auto mb-4">
            <Brain weight="fill" className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">Second Brain</h1>
          <p className="text-[13px] text-text-muted mt-1">创建新账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-[13px] text-danger px-3 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] text-text-ghost mb-1.5">用户名 *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-ghost outline-none focus:border-border-accent transition-colors"
              placeholder="3-64 个字符"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-ghost mb-1.5">邮箱 *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-ghost outline-none focus:border-border-accent transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-ghost mb-1.5">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-ghost outline-none focus:border-border-accent transition-colors"
              placeholder="默认使用用户名"
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-ghost mb-1.5">密码 *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-ghost outline-none focus:border-border-accent transition-colors"
              placeholder="至少 6 个字符"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "注册中..." : "注册"}
          </button>

          <p className="text-center text-xs text-text-ghost">
            已有账户？{" "}
            <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
              登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
