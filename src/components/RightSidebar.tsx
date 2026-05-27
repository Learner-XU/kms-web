"use client"

import { useState, useEffect } from "react"
import { Info, Link, ChartLine, Clock, FileText } from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { searchAPI, SearchResult } from "@/lib/api"

export default function RightSidebar() {
  const { currentNote } = useKMSStore()
  const [backlinks, setBacklinks] = useState<SearchResult[]>([])

  useEffect(() => {
    if (currentNote?.id) {
      searchAPI.backlinks(currentNote.id).then(({ backlinks }) => setBacklinks(backlinks || [])).catch(() => {})
    } else {
      setBacklinks([])
    }
  }, [currentNote?.id])

  if (!currentNote) {
    return (
      <div className="w-72 min-w-72 bg-bg-surface border-l border-border-default flex items-center justify-center h-screen">
        <span className="text-xs text-text-ghost">选择笔记查看详情</span>
      </div>
    )
  }

  return (
    <div className="w-72 min-w-72 bg-bg-surface border-l border-border-default flex flex-col h-screen overflow-y-auto">
      {/* Note Info */}
      <Section title="笔记信息" icon={<Info className="w-3.5 h-3.5" />}>
        <div className="space-y-3">
          {currentNote.tags && currentNote.tags.length > 0 && (
            <div>
              <span className="text-[10px] text-text-ghost block mb-1.5">标签</span>
              <div className="flex flex-wrap gap-1.5">
                {currentNote.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 text-[10px] text-accent bg-accent-subtle rounded">#{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-ghost">状态</span>
              <span className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-text-tertiary">{currentNote.status}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-ghost">类型</span>
              <span className="text-xs text-text-tertiary">{currentNote.type}</span>
            </div>
            {currentNote.source && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-ghost">来源</span>
                <span className="text-xs text-text-tertiary truncate max-w-[140px] font-mono">{currentNote.source}</span>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Backlinks */}
      <Section title={`反向链接 (${backlinks.length})`} icon={<Link className="w-3.5 h-3.5" />}>
        {backlinks.length === 0 ? (
          <span className="text-xs text-text-ghost">暂无反向链接</span>
        ) : (
          <div className="space-y-0.5">
            {backlinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-text-tertiary hover:text-accent-hover hover:bg-bg-hover rounded-md cursor-pointer transition-colors"
                onClick={() => useKMSStore.getState().loadNote(link.path)}
              >
                <FileText className="w-3 h-3 shrink-0 text-text-ghost" />
                <span className="truncate">{link.title}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Related Notes */}
      <Section title="相关笔记" icon={<ChartLine className="w-3.5 h-3.5" />}>
        {!currentNote.links || currentNote.links.length === 0 ? (
          <span className="text-xs text-text-ghost">暂无关联笔记</span>
        ) : (
          <div className="space-y-0.5">
            {currentNote.links.slice(0, 5).map((link, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-text-tertiary hover:text-accent-hover hover:bg-bg-hover rounded-md cursor-pointer transition-colors"
              >
                <FileText className="w-3 h-3 shrink-0 text-text-ghost" />
                <span className="truncate">{link}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Activity */}
      <Section title="活动" icon={<Clock className="w-3.5 h-3.5" />}>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-ghost">{formatDate(currentNote.updated)}</span>
            <span className="text-text-muted">最后更新</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-ghost">{formatDate(currentNote.created)}</span>
            <span className="text-text-muted">创建</span>
          </div>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-4 py-4 border-b border-border-subtle">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-text-ghost">{icon}</span>
        <span className="text-[11px] font-medium text-text-muted">{title}</span>
      </div>
      {children}
    </div>
  )
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
  } catch {
    return d
  }
}
