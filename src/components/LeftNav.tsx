"use client"

import { useState } from "react"
import {
  Home, FileText, Calendar, Network, CheckSquare, Bot,
  ChevronDown, ChevronRight, Plus, Settings,
  Clock, Bookmark, Star, Lightbulb, Brain,
} from "lucide-react"
import { useKMSStore } from "@/lib/store"

const workspaces = [
  { name: "Home", icon: "home", view: "notes" as const },
  { name: "笔记", icon: "file-text", view: "notes" as const },
  { name: "日记", icon: "calendar", view: "diary" as const },
  { name: "图谱", icon: "network", view: "graph" as const },
  { name: "任务", icon: "check-square", view: "tasks" as const },
  { name: "AI 助手", icon: "bot", view: "ai" as const },
]

const spaces = [
  { name: "工程", key: "engineering", children: ["Backend", "DevOps", "数据库", "AI & ML"] },
  { name: "研究", key: "research", children: [] },
  { name: "生活", key: "life", children: [] },
  { name: "创业", key: "startup", children: [] },
]

const collections = [
  { name: "最近编辑", icon: "clock", count: 0 },
  { name: "稍后阅读", icon: "bookmark", count: 0 },
  { name: "高频引用", icon: "star", count: 0 },
  { name: "灵感收集", icon: "lightbulb", count: 0 },
]

const tags = ["Go", "Kubernetes", "分布式系统", "微服务", "设计模式", "AI"]

const iconMap: Record<string, React.ElementType> = {
  home: Home, "file-text": FileText, calendar: Calendar,
  network: Network, "check-square": CheckSquare, bot: Bot,
  clock: Clock, bookmark: Bookmark, star: Star, lightbulb: Lightbulb,
}

export default function LeftNav() {
  const { activeView, setActiveView, setActiveSpace, loadNotes } = useKMSStore()
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({
    engineering: true,
  })

  const toggleSpace = (key: string) => {
    setExpandedSpaces((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleWorkspaceClick = (view: typeof activeView) => {
    setActiveView(view)
  }

  const handleSpaceClick = (space: string) => {
    setActiveSpace(space)
    loadNotes(`notes/${space}`)
  }

  return (
    <div className="w-60 min-w-60 bg-bg-sidebar border-r border-border-default flex flex-col h-screen overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border-divider">
        <Brain className="w-6 h-6 text-accent-purple" />
        <span className="text-text-primary font-semibold text-sm">Second Brain</span>
        <div className="ml-auto">
          <Settings className="w-4 h-4 text-text-muted hover:text-text-primary cursor-pointer transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Workspace */}
        <Section title="工作区">
          {workspaces.map((w) => {
            const Icon = iconMap[w.icon] || FileText
            const isActive = activeView === w.view
            return (
              <NavItem key={w.name} active={isActive} onClick={() => handleWorkspaceClick(w.view)}>
                <Icon className="w-4 h-4" />
                <span>{w.name}</span>
              </NavItem>
            )
          })}
        </Section>

        {/* Spaces */}
        <Section title="空间" action={<Plus className="w-3.5 h-3.5 text-text-muted hover:text-text-primary cursor-pointer" />}>
          {spaces.map((s) => (
            <div key={s.key}>
              <div
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-tertiary hover:text-text-primary hover:bg-bg-hover cursor-pointer rounded transition-colors"
                onClick={() => toggleSpace(s.key)}
              >
                {expandedSpaces[s.key] ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>{s.name}</span>
              </div>
              {expandedSpaces[s.key] && s.children.length > 0 && (
                <div className="ml-6">
                  {s.children.map((child) => (
                    <div
                      key={child}
                      className="px-3 py-1 text-xs text-text-muted hover:text-text-secondary hover:bg-bg-hover cursor-pointer rounded transition-colors"
                      onClick={() => handleSpaceClick(s.key)}
                    >
                      {child}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>

        {/* Collections */}
        <Section title="收藏">
          {collections.map((c) => {
            const Icon = iconMap[c.icon] || Star
            return (
              <NavItem key={c.name}>
                <Icon className="w-4 h-4" />
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-text-muted">{c.count}</span>
              </NavItem>
            )
          })}
        </Section>

        {/* Tags */}
        <Section title="标签">
          <div className="flex flex-wrap gap-1.5 px-3 py-1">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[11px] text-accent-blue bg-accent-blue/15 rounded-full cursor-pointer hover:bg-accent-blue/25 transition-colors"
              >
                #{t}
              </span>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

function NavItem({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  const cls = active
    ? "bg-bg-selected text-text-primary border-l-2 border-accent-blue"
    : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"
  return (
    <div className={`flex items-center gap-2.5 px-4 py-1.5 text-sm cursor-pointer transition-colors rounded mx-1 ${cls}`} onClick={onClick}>
      {children}
    </div>
  )
}
