"use client"

import { useState } from "react"
import {
  House, FileText, Calendar, Graph, CheckSquare, Robot,
  CaretDown, CaretRight, Plus, Gear,
  Clock, Bookmark, Star, Lightbulb, Brain,
  SignOut, User,
} from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { motion, AnimatePresence } from "motion/react"

const workspaces = [
  { name: "Home", icon: House, view: "notes" as const },
  { name: "笔记", icon: FileText, view: "notes" as const },
  { name: "日记", icon: Calendar, view: "diary" as const },
  { name: "图谱", icon: Graph, view: "graph" as const },
  { name: "任务", icon: CheckSquare, view: "tasks" as const },
  { name: "AI 助手", icon: Robot, view: "ai" as const },
]

const spaces = [
  { name: "工程", key: "engineering", children: ["Backend", "DevOps", "数据库", "AI & ML"] },
  { name: "研究", key: "research", children: [] },
  { name: "生活", key: "life", children: [] },
  { name: "创业", key: "startup", children: [] },
]

const collections = [
  { name: "最近编辑", icon: Clock, count: 0 },
  { name: "稍后阅读", icon: Bookmark, count: 0 },
  { name: "高频引用", icon: Star, count: 0 },
  { name: "灵感收集", icon: Lightbulb, count: 0 },
]

const tags = ["Go", "Kubernetes", "分布式系统", "微服务", "设计模式", "AI"]

export default function LeftNav() {
  const { activeView, setActiveView, setActiveSpace, loadNotes, user, logout } = useKMSStore()
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({
    engineering: true,
  })

  const toggleSpace = (key: string) => {
    setExpandedSpaces((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-60 min-w-60 bg-bg-surface border-r border-border-default flex flex-col h-screen overflow-hidden">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border-subtle shrink-0">
        <div className="w-7 h-7 rounded-md bg-accent-muted flex items-center justify-center">
          <Brain weight="fill" className="w-4 h-4 text-accent" />
        </div>
        <span className="text-text-primary font-semibold text-[13px] tracking-tight">Second Brain</span>
        <button className="ml-auto text-text-ghost hover:text-text-tertiary transition-colors">
          <Gear className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto py-3 space-y-5">
        {/* Workspace */}
        <Section title="工作区">
          {workspaces.map((w) => {
            const isActive = activeView === w.view
            return (
              <NavItem key={w.name} active={isActive} onClick={() => setActiveView(w.view)}>
                <w.icon weight={isActive ? "fill" : "regular"} className="w-4 h-4" />
                <span>{w.name}</span>
              </NavItem>
            )
          })}
        </Section>

        {/* Spaces */}
        <Section title="空间" action={<Plus className="w-3.5 h-3.5 text-text-ghost hover:text-text-tertiary cursor-pointer transition-colors" />}>
          {spaces.map((s) => (
            <div key={s.key}>
              <div
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-text-tertiary hover:text-text-secondary hover:bg-bg-hover cursor-pointer rounded-md transition-colors"
                onClick={() => toggleSpace(s.key)}
              >
                {expandedSpaces[s.key] ? (
                  <CaretDown className="w-3.5 h-3.5 text-text-ghost" />
                ) : (
                  <CaretRight className="w-3.5 h-3.5 text-text-ghost" />
                )}
                <span>{s.name}</span>
              </div>
              <AnimatePresence>
                {expandedSpaces[s.key] && s.children.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="overflow-hidden ml-5"
                  >
                    {s.children.map((child) => (
                      <div
                        key={child}
                        className="px-3 py-1 text-xs text-text-muted hover:text-text-tertiary hover:bg-bg-hover cursor-pointer rounded-md transition-colors"
                        onClick={() => {
                          setActiveSpace(s.key)
                          loadNotes(`notes/${s.key}`)
                        }}
                      >
                        {child}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Section>

        {/* Collections */}
        <Section title="收藏">
          {collections.map((c) => (
            <NavItem key={c.name}>
              <c.icon className="w-4 h-4" />
              <span className="flex-1">{c.name}</span>
              {c.count > 0 && (
                <span className="text-[11px] text-text-ghost tabular-nums">{c.count}</span>
              )}
            </NavItem>
          ))}
        </Section>

        {/* Tags */}
        <Section title="标签">
          <div className="flex flex-wrap gap-1.5 px-3 py-1">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[11px] text-accent bg-accent-subtle rounded-md cursor-pointer hover:bg-accent-muted transition-colors"
              >
                #{t}
              </span>
            ))}
          </div>
        </Section>
      </div>

      {/* User */}
      {user && (
        <div className="px-3 py-3 border-t border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-bg-muted flex items-center justify-center">
              <User weight="bold" className="w-3.5 h-3.5 text-text-tertiary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-text-primary truncate leading-tight">{user.nickname || user.username}</div>
              <div className="text-[11px] text-text-muted truncate">@{user.username}</div>
            </div>
            <button onClick={logout} className="text-text-ghost hover:text-danger transition-colors" title="退出登录">
              <SignOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 mb-1">
        <span className="text-[10px] font-medium text-text-ghost uppercase tracking-[0.08em]">{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

function NavItem({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-1.5 mx-1.5 text-[13px] cursor-pointer rounded-md transition-all duration-150 ${
        active
          ? "bg-accent-subtle text-accent-hover"
          : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
