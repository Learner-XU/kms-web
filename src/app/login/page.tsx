"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useKMSStore } from "@/lib/store"

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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">KMS 知识管理系统</h1>
          <p className="text-sm text-text-muted mt-2">登录你的账户</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card border border-border-default rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-red-500/15 text-red-400 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue"
              placeholder="输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue"
              placeholder="输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-blue text-white py-2 rounded-md text-sm font-medium hover:bg-accent-blue/80 transition-colors disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>

          <p className="text-center text-sm text-text-muted">
            还没有账户？{" "}
            <Link href="/register" className="text-accent-blue hover:underline">
              注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
