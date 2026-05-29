"use client"

import { useState, useEffect } from "react"
import { Info, Link, ChartLine, Clock, FileText, X, List } from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { searchAPI, SearchResult } from "@/lib/api"
import { motion, AnimatePresence } from "motion/react"
import { formatDate } from "@/lib/utils"

export default function RightSidebar() {
  const { currentNote, showRightSidebar, setShowRightSidebar } = useKMSStore(
    useShallow((s) => ({ currentNote: s.currentNote, showRightSidebar: s.showRightSidebar, setShowRightSidebar: s.setShowRightSidebar }))
  )
  const [backlinks, setBacklinks] = useState<SearchResult[]>([])
  const [backlinksError, setBacklinksError] = useState<string | null>(null)

  useEffect(() => {
    if (showRightSidebar && currentNote?.id) {
      setBacklinksError(null)
      let cancelled = false
      searchAPI.backlinks(currentNote.id)
        .then(({ backlinks }) => { if (!cancelled) setBacklinks(backlinks || []) })
        .catch(() => { if (!cancelled) setBacklinksError("无法加载反向链接") })
      return () => { cancelled = true }
    } else {
      setBacklinks([])
      setBacklinksError(null)
    }
  }, [showRightSidebar, currentNote?.id])

  if (!currentNote) return null

  return (
    <AnimatePresence>
      {showRightSidebar && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setShowRightSidebar(false)}
          />
          {/* 面板 */}
          <motion.div
            initial={{ x: 288 }}
            animate={{ x: 0 }}
            exit={{ x: 288 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed right-0 top-0 z-50 w-72 h-screen bg-bg-surface border-l border-border-default flex flex-col overflow-y-auto shadow-xl"
          >
            {/* 关闭按钮 */}
            <div className="flex items-center justify-between px-4 h-11 border-b border-border-subtle shrink-0">
              <span className="text-[13px] font-medium text-text-secondary">笔记信息</span>
              <button onClick={() => setShowRightSidebar(false)} className="p-1 text-text-ghost hover:text-text-tertiary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 笔记信息 */}
            <Section title="详情" icon={<Info className="w-3.5 h-3.5" />}>
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

            {/* 反向链接 */}
            <Section title={`反向链接 (${backlinks.length})`} icon={<Link className="w-3.5 h-3.5" />}>
              {backlinksError ? (
                <span className="text-xs text-red-400">{backlinksError}</span>
              ) : backlinks.length === 0 ? (
                <span className="text-xs text-text-ghost">暂无反向链接</span>
              ) : (
                <div className="space-y-0.5">
                  {backlinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-text-tertiary hover:text-accent-hover hover:bg-bg-hover rounded-md cursor-pointer transition-colors"
                      onClick={() => { useKMSStore.getState().loadNote(link.path); setShowRightSidebar(false) }}
                    >
                      <FileText className="w-3 h-3 shrink-0 text-text-ghost" />
                      <span className="truncate">{link.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* 相关笔记 */}
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

            {/* 大纲 */}
            {currentNote.content && (() => {
              const headings = currentNote.content.split("\n").filter(l => /^#{1,3}\s/.test(l)).map(l => {
                const level = l.match(/^(#+)/)?.[1].length || 1
                const text = l.replace(/^#+\s*/, "")
                return { level, text }
              })
              return headings.length > 0 ? (
                <Section title={`大纲 (${headings.length})`} icon={<List className="w-3.5 h-3.5" />}>
                  <div className="space-y-0.5">
                    {headings.map((h, i) => (
                      <div
                        key={i}
                        className="text-[12px] text-text-tertiary hover:text-accent-hover hover:bg-bg-hover rounded-md px-2 py-1 cursor-pointer transition-colors truncate"
                        style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
                      >
                        {h.text}
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null
            })()}

            {/* 活动 */}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
