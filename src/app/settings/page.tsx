"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, User, Palette, Database, Shield,
  Moon, Sun, SignOut, GithubLogo,
} from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useKMSStore(
    useShallow((s) => ({ user: s.user, logout: s.logout }))
  )
  const [activeTab, setActiveTab] = useState("account")

  const tabs = [
    { key: "account", label: "账户", icon: User },
    { key: "appearance", label: "外观", icon: Palette },
    { key: "data", label: "数据", icon: Database },
    { key: "security", label: "安全", icon: Shield },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base">
      {/* Sidebar */}
      <aside className="w-60 min-w-60 bg-bg-surface border-r border-border-default flex flex-col h-screen shrink-0">
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border-subtle">
          <button onClick={() => router.back()} className="p-1.5 rounded-md text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[14px] font-semibold text-text-primary">设置</span>
        </div>
        <nav className="px-3 py-3 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors mb-0.5 ${
                activeTab === tab.key
                  ? "bg-accent-subtle text-accent-hover font-medium"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-5 pb-5">
          <button
            onClick={() => { logout(); router.push("/login") }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <SignOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-bg-base">
        <div className="max-w-[640px] mx-auto px-8 py-10">
          {activeTab === "account" && (
            <div className="space-y-6">
              <h2 className="text-[18px] font-semibold text-text-primary">账户设置</h2>
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-[11px] text-text-ghost block mb-1">用户名</label>
                  <div className="text-[14px] text-text-primary">{user?.username || "-"}</div>
                </div>
                <div>
                  <label className="text-[11px] text-text-ghost block mb-1">昵称</label>
                  <div className="text-[14px] text-text-primary">{user?.nickname || "-"}</div>
                </div>
                <div>
                  <label className="text-[11px] text-text-ghost block mb-1">邮箱</label>
                  <div className="text-[14px] text-text-primary">{user?.email || "-"}</div>
                </div>
                <div>
                  <label className="text-[11px] text-text-ghost block mb-1">角色</label>
                  <span className="px-2 py-0.5 text-[11px] bg-accent/10 text-accent rounded-full">{user?.role || "member"}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-[18px] font-semibold text-text-primary">外观设置</h2>
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] text-text-primary">主题</div>
                    <div className="text-[11px] text-text-ghost">当前使用暗色主题</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-accent-subtle text-accent"><Moon className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg text-text-ghost hover:bg-bg-hover"><Sun className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-6">
              <h2 className="text-[18px] font-semibold text-text-primary">数据管理</h2>
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] text-text-primary">Git 仓库</div>
                    <div className="text-[11px] text-text-ghost">知识存储在 Gitea 仓库中</div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[12px] text-emerald-400"><GithubLogo className="w-3.5 h-3.5" /> 已连接</span>
                </div>
                <div className="border-t border-border-subtle pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] text-text-primary">个人简历</div>
                      <div className="text-[11px] text-text-ghost">存储在浏览器 localStorage</div>
                    </div>
                    <button
                      onClick={() => { localStorage.removeItem("kms_profile"); alert("已清除") }}
                      className="px-3 py-1.5 text-[11px] text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      清除数据
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-[18px] font-semibold text-text-primary">安全设置</h2>
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
                <div className="text-[13px] text-text-primary mb-2">JWT Token</div>
                <div className="text-[11px] text-text-ghost mb-3">Token 存储在浏览器中，用于 API 认证</div>
                <button
                  onClick={() => { logout(); router.push("/login") }}
                  className="px-4 py-2 text-[12px] text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  清除 Token 并重新登录
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
