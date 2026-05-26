"use client"

import { currentNote, backLinks, relatedNotes, activities } from "@/lib/mock-data"
import { Info, Link, BarChart3, Clock } from "lucide-react"

export default function RightSidebar() {
  return (
    <div className="w-70 min-w-70 bg-bg-sidebar border-l border-border-default flex flex-col h-screen overflow-y-auto">
      {/* Note Info */}
      <Section title="笔记信息" icon={<Info className="w-4 h-4" />}>
        <div className="space-y-3">
          {/* Tags */}
          <div>
            <span className="text-[11px] text-text-muted block mb-1.5">标签</span>
            <div className="flex flex-wrap gap-1.5">
              {currentNote.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[11px] text-accent-blue bg-accent-blue/15 rounded-full"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Status & Type */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">状态</span>
              <span className="flex items-center gap-1.5 text-xs text-accent-green">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                {currentNote.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">类型</span>
              <span className="text-xs text-text-tertiary">{currentNote.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">来源</span>
              <span className="text-xs text-text-tertiary">{currentNote.source}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Backlinks */}
      <Section title={`反向链接 (${backLinks.length})`} icon={<Link className="w-4 h-4" />}>
        <div className="space-y-1">
          {backLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-text-tertiary hover:text-accent-blue hover:bg-bg-hover rounded cursor-pointer transition-colors"
            >
              <span className="text-text-muted">·</span>
              <span className="truncate">{link.title}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Related Notes */}
      <Section title="相关笔记" icon={<BarChart3 className="w-4 h-4" />}>
        <div className="space-y-1">
          {relatedNotes.map((note) => (
            <div
              key={note.id}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-text-tertiary hover:text-accent-blue hover:bg-bg-hover rounded cursor-pointer transition-colors"
            >
              <span className="text-text-muted">·</span>
              <span className="truncate">{note.title}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Recent Activity */}
      <Section title="最近活动" icon={<Clock className="w-4 h-4" />}>
        <div className="space-y-2">
          {activities.map((act, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">{act.time}</span>
              <span className="text-text-tertiary">{act.action}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="px-4 py-4 border-b border-border-divider">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-text-muted">{icon}</span>
        <span className="text-xs font-medium text-text-tertiary">{title}</span>
      </div>
      {children}
    </div>
  )
}
