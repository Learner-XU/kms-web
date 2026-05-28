"use client"

import { useState, useCallback } from "react"
import { Lightbulb, X, DotsThree, FloppyDisk, PencilSimple, FileText, Info } from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { formatDate } from "@/lib/utils"

export default function MainEditor() {
  const { currentNote, updateNote, loadNote, searchResults, searchQuery, setShowRightSidebar } = useKMSStore(
    useShallow((s) => ({ currentNote: s.currentNote, updateNote: s.updateNote, loadNote: s.loadNote, searchResults: s.searchResults, searchQuery: s.searchQuery, setShowRightSidebar: s.setShowRightSidebar }))
  )
  const [editContent, setEditContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
  )
}
