"use client"

import { useState, useCallback, useEffect } from "react"
import { Lightbulb, X, DotsThree, FloppyDisk, PencilSimple, FileText, Info, Clock, Globe, Link } from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { formatDate } from "@/lib/utils"
import { publishedAPI } from "@/lib/api"

export default function MainEditor() {
  const { currentNote, searchResults, searchQuery } = useKMSStore(
    useShallow((s) => ({ currentNote: s.currentNote, searchResults: s.searchResults, searchQuery: s.searchQuery }))
  )
  const updateNote = useKMSStore((s) => s.updateNote)
  const loadNote = useKMSStore((s) => s.loadNote)
  const setShowRightSidebar = useKMSStore((s) => s.setShowRightSidebar)
  const [editContent, setEditContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishSlug, setPublishSlug] = useState("")
  const [publishing, setPublishing] = useState(false)

  // Check publish status when note changes
  useEffect(() => {
    if (!currentNote) { setPublishedSlug(null); return }
    let cancelled = false
    publishedAPI.check(currentNote.path).then((res) => {
      if (!cancelled) setPublishedSlug(res?.slug || null)
    })
    return () => { cancelled = true }
  }, [currentNote?.path])

  // All hooks must be declared before any conditional returns (Rules of Hooks)
  const handleSave = useCallback(async () => {
    if (currentNote && editContent !== currentNote.content) {
      setSaveError(null)
      try {
        await updateNote(currentNote.path, editContent)
        setIsEditing(false)
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : '保存失败')
      }
    }
  }, [currentNote, editContent, updateNote])

  const startEdit = useCallback(() => {
    if (currentNote) {
      setEditContent(currentNote.content)
      setIsEditing(true)
    }
  }, [currentNote])

  const openPublish = useCallback(() => {
    if (!currentNote) return
    // Default slug: note ID (first 8 chars) or existing slug
    setPublishSlug(publishedSlug || currentNote.id.slice(0, 8))
    setShowPublishModal(true)
  }, [currentNote, publishedSlug])

  const handlePublish = async () => {
    if (!currentNote || !publishSlug.trim()) return
    setPublishing(true)
    try {
      const res = await publishedAPI.publish(currentNote.path, publishSlug.trim())
      setPublishedSlug(res.slug)
      setShowPublishModal(false)
    } catch (e) {
      console.error("Publish failed:", e)
    }
    setPublishing(false)
  }

  const handleUnpublish = async () => {
    if (!currentNote) return
    try {
      await publishedAPI.unpublish(currentNote.path)
      setPublishedSlug(null)
    } catch (e) {
      console.error("Unpublish failed:", e)
    }
  }

  // Search results view
  if (searchQuery && searchResults.length > 0 && !currentNote) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-bg-base overflow-hidden">
        <div className="flex items-center gap-2 px-4 h-11 border-b border-border-subtle bg-bg-surface shrink-0">
          <span className="text-[13px] text-text-muted">搜索 &quot;{searchQuery}&quot;</span>
          <span className="text-[11px] text-text-ghost">{searchResults.length} 条结果</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[860px] mx-auto space-y-2">
            {searchResults.map((r) => (
              <div
                key={r.id}
                className="group border border-border-default rounded-lg p-4 hover:border-border-accent cursor-pointer transition-colors"
                onClick={() => loadNote(r.path)}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[13px] font-medium text-text-primary group-hover:text-accent-hover transition-colors">{r.title}</span>
                  <span className="text-[11px] text-text-ghost font-mono">{r.path}</span>
                </div>
                {r.summary && <p className="text-[13px] text-text-tertiary mb-1.5 line-clamp-2">{r.summary}</p>}
                {r.snippet && <p className="text-xs text-text-muted line-clamp-1">{r.snippet}</p>}
                {r.tags && r.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {r.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 text-[10px] text-accent bg-accent-subtle rounded">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <FileText className="w-10 h-10 text-text-ghost mx-auto mb-3" weight="light" />
          <p className="text-sm text-text-muted mb-1">选择一篇笔记</p>
          <p className="text-xs text-text-ghost">点击上方按钮浏览文件</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="flex-1 flex flex-col h-screen bg-bg-base overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-3 h-11 border-b border-border-subtle bg-bg-surface shrink-0">
        <div className="flex items-center gap-2 px-3 py-1 bg-bg-elevated rounded-t-md text-[13px] text-text-primary border border-border-default border-b-0 -mb-[1px]">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="max-w-[200px] truncate">{currentNote.title}</span>
          <button
            onClick={() => useKMSStore.getState().setCurrentNote(null)}
            className="text-text-ghost hover:text-text-tertiary transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent-hover active:scale-[0.98] transition-all"
            >
              <FloppyDisk className="w-3 h-3" /> 保存
            </button>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-tertiary border border-border-default rounded-md hover:bg-bg-hover hover:text-text-secondary active:scale-[0.98] transition-all"
            >
              <PencilSimple className="w-3 h-3" /> 编辑
            </button>
          )}
          <button
            onClick={() => setShowRightSidebar(true)}
            className="p-1.5 text-text-ghost hover:text-text-tertiary transition-colors"
            title="笔记信息"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => useKMSStore.getState().setShowHistory(true)}
            className="p-1.5 text-text-ghost hover:text-text-tertiary transition-colors"
            title="版本历史"
          >
            <Clock className="w-4 h-4" />
          </button>
          {publishedSlug ? (
            <div className="flex items-center gap-1">
              <a
                href={`/p/${publishedSlug}`}
                target="_blank"
                rel="noopener"
                className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                title="已发布 — 查看公开页"
              >
                <Globe className="w-4 h-4" />
              </a>
              <button
                onClick={handleUnpublish}
                className="p-1.5 text-text-ghost hover:text-danger transition-colors"
                title="取消发布"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openPublish}
              className="p-1.5 text-text-ghost hover:text-text-tertiary transition-colors"
              title="发布笔记"
            >
              <Globe className="w-4 h-4" />
            </button>
          )}
          <button className="p-1.5 text-text-ghost hover:text-text-tertiary transition-colors">
            <DotsThree className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-4 md:px-8 py-6 md:py-8">
          {/* Save error */}
          {saveError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-[13px] text-red-400">保存失败: {saveError}</p>
            </div>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[11px] text-text-ghost mb-6 font-mono">
            {currentNote.path.split("/").map((seg, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className={i === arr.length - 1 ? "text-text-tertiary" : "text-text-ghost"}>{seg}</span>
                {i < arr.length - 1 && <span className="text-border-emphasis">/</span>}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-[26px] font-semibold text-text-primary tracking-tight leading-tight mb-3">
            {currentNote.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-text-muted mb-8 flex-wrap">
            <span>{formatDate(currentNote.created)}</span>
            <span className="w-1 h-1 rounded-full bg-text-ghost" />
            <span>更新 {formatDate(currentNote.updated)}</span>
            {currentNote.tags?.map((t) => (
              <span key={t} className="px-1.5 py-0.5 text-[10px] text-accent bg-accent-subtle rounded">#{t}</span>
            ))}
          </div>

          {/* Summary Callout */}
          {currentNote.summary && (
            <div className="bg-accent-subtle border border-border-accent rounded-lg p-4 mb-8">
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb weight="fill" className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold text-accent-hover">摘要</span>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed">{currentNote.summary}</p>
            </div>
          )}

          {/* Content */}
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[400px] bg-bg-surface border border-border-default rounded-lg p-4 text-[13px] text-text-secondary font-mono leading-relaxed outline-none focus:border-border-accent resize-y transition-colors"
            />
          ) : (
            <div className="text-[14px] text-text-secondary leading-[1.8] whitespace-pre-wrap selection:bg-accent-muted">
              {currentNote.content}
            </div>
          )}
        </div>
      </div>
    </div>
    {/* Publish Modal */}
    {showPublishModal && (
      <>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowPublishModal(false)} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[440px] bg-bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
            <h3 className="text-[14px] font-semibold text-text-primary">发布笔记</h3>
            <button onClick={() => setShowPublishModal(false)} className="p-1 text-text-ghost hover:text-text-secondary"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[11px] text-text-ghost mb-1 block">链接标识 (slug)</label>
              <input
                value={publishSlug}
                onChange={(e) => setPublishSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="w-full px-3 py-2 text-[13px] bg-bg-base border border-border-default rounded-lg outline-none focus:border-accent text-text-primary font-mono"
                placeholder="my-note"
              />
              <p className="text-[11px] text-text-ghost mt-1.5">
                公开链接: <span className="text-accent font-mono">/p/{publishSlug || '...'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-subtle">
            <button onClick={() => setShowPublishModal(false)} className="px-4 py-1.5 text-[12px] text-text-ghost border border-border-default rounded-lg hover:bg-bg-hover transition-colors">取消</button>
            <button onClick={handlePublish} disabled={!publishSlug.trim() || publishing} className="px-4 py-1.5 text-[12px] font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {publishing ? "发布中..." : "确认发布"}
            </button>
          </div>
        </div>
      </>
    )}
    </>
  )
}
