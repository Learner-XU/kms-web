"use client"

import { useState, useEffect } from "react"
import {
  FileText, Tag, Link, TrendUp,
  BookOpen, Calendar, Lightbulb,
} from "@phosphor-icons/react"
import { fetchAPI, type SearchResult } from "@/lib/api"

interface Stats {
  total_notes: number
  by_type: Record<string, number>
  by_status: Record<string, number>
  tag_count: number
  link_count: number
  recent_notes: SearchResult[]
}

const typeLabels: Record<string, string> = {
  note: "知识笔记",
  daily: "日记",
  source: "来源摘录",
  project: "项目笔记",
}

const typeIcons: Record<string, typeof FileText> = {
  note: FileText,
  daily: Calendar,
  source: BookOpen,
  project: Lightbulb,
}

const statusLabels: Record<string, string> = {
  seed: "种子",
  growing: "成长中",
  mature: "成熟",
  archived: "已归档",
}

const statusColorMap: Record<string, { bg: string; text: string }> = {
  seed: { bg: "bg-gray-500/20", text: "text-gray-400" },
  growing: { bg: "bg-amber-500/20", text: "text-amber-400" },
  mature: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  archived: { bg: "bg-slate-500/20", text: "text-slate-400" },
}

export default function StatsView({ onNoteClick }: { onNoteClick?: (path: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAPI<Stats>("/api/stats")
      .then(setStats)
      .catch((e) => { console.error("Failed to load stats:", e) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base">
        <span className="text-[13px] text-text-ghost">加载中...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base">
        <span className="text-[13px] text-text-ghost">无法加载统计数据</span>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-base">
      <div className="max-w-[900px] mx-auto px-8 py-10">
        <h1 className="text-[22px] font-bold text-text-primary mb-8">知识库概览</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FileText className="w-5 h-5" />} label="笔记总数" value={stats.total_notes} />
          <StatCard icon={<Tag className="w-5 h-5" />} label="标签数" value={stats.tag_count} />
          <StatCard icon={<Link className="w-5 h-5" />} label="链接数" value={stats.link_count} />
          <StatCard icon={<TrendUp className="w-5 h-5" />} label="类型数" value={Object.keys(stats.by_type).length} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* By Type */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-text-primary mb-4">按类型分布</h3>
            <div className="space-y-3">
              {Object.entries(stats.by_type).map(([type, count]) => {
                const Icon = typeIcons[type] || FileText
                const pct = stats.total_notes > 0 ? (count / stats.total_notes) * 100 : 0
                return (
                  <div key={type} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-text-ghost shrink-0" />
                    <span className="text-[12px] text-text-secondary w-20">{typeLabels[type] || type}</span>
                    <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] text-text-ghost w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Status */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-text-primary mb-4">按状态分布</h3>
            <div className="space-y-3">
              {Object.entries(stats.by_status).map(([status, count]) => {
                const pct = stats.total_notes > 0 ? (count / stats.total_notes) * 100 : 0
                const colors = statusColorMap[status] || { bg: "bg-bg-base", text: "text-text-ghost" }
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full w-16 text-center ${colors.bg} ${colors.text}`}>
                      {statusLabels[status] || status}
                    </span>
                    <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] text-text-ghost w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent notes */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">最近更新</h3>
          <div className="space-y-2">
            {stats.recent_notes.map(note => (
              <div
                key={note.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
                onClick={() => onNoteClick?.(note.path)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-[13px] text-text-primary flex-1 truncate">{note.title}</span>
                {note.tags?.slice(0, 2).map(t => (
                  <span key={t} className="px-1.5 py-0.5 text-[10px] text-accent bg-accent-subtle rounded">#{t}</span>
                ))}
                <span className="text-[11px] text-text-ghost">{typeLabels[note.type] || note.type}</span>
              </div>
            ))}
            {stats.recent_notes.length === 0 && (
              <p className="text-[12px] text-text-ghost">暂无笔记</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
      <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center mb-3 text-accent">
        {icon}
      </div>
      <div className="text-[22px] font-bold text-text-primary">{value}</div>
      <div className="text-[11px] text-text-ghost mt-0.5">{label}</div>
    </div>
  )
}
