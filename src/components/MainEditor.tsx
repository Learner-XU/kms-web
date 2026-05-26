"use client"

import { useState } from "react"
import { Lightbulb, X, MoreHorizontal, Save } from "lucide-react"
import { useKMSStore } from "@/lib/store"

export default function MainEditor() {
  const { currentNote, updateNote, loadNote, searchResults, searchQuery, clearSearch } = useKMSStore()
  const [editContent, setEditContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  if (searchQuery && searchResults.length > 0 && !currentNote) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-bg-primary overflow-hidden">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border-divider bg-bg-sidebar">
          <span className="text-sm text-text-muted">搜索结果: {searchQuery}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[860px] mx-auto space-y-3">
            {searchResults.map((r) => (
              <div key={r.id} className="bg-bg-card border border-border-default rounded-md p-4 hover:border-accent-blue cursor-pointer transition-colors" onClick={() => loadNote(r.path)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-text-primary font-medium">{r.title}</span>
                  <span className="text-[11px] text-text-muted">{r.path}</span>
                </div>
                {r.summary && <p className="text-sm text-text-tertiary mb-2">{r.summary}</p>}
                {r.snippet && <p className="text-xs text-text-muted" dangerouslySetInnerHTML={{ __html: r.snippet }} />}
                <div className="flex gap-1.5 mt-2">
                  {r.tags?.map((t) => (
                    <span key={t} className="px-2 py-0.5 text-[10px] text-accent-blue bg-accent-blue/15 rounded-full">#{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <div className="text-center text-text-muted">
          <p className="text-lg mb-2">选择一篇笔记开始阅读</p>
          <p className="text-sm">或使用左侧搜索框查找</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (currentNote && editContent !== currentNote.content) {
      await updateNote(currentNote.path, editContent)
      setIsEditing(false)
    }
  }

  const startEdit = () => {
    setEditContent(currentNote.content)
    setIsEditing(true)
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("zh-CN") } catch { return d }
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-bg-primary overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border-divider bg-bg-sidebar">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary rounded-t text-sm text-text-primary">
          <span className="w-2 h-2 rounded-full bg-accent-blue" />
          <span>{currentNote.title}</span>
          <X className="w-3.5 h-3.5 text-text-muted hover:text-text-primary cursor-pointer" onClick={() => useKMSStore.getState().setCurrentNote(null)} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isEditing ? (
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 text-xs bg-accent-blue text-white rounded hover:bg-accent-blue/80 transition-colors">
              <Save className="w-3 h-3" /> 保存
            </button>
          ) : (
            <button onClick={startEdit} className="flex items-center gap-1 px-3 py-1 text-xs text-text-muted hover:text-text-primary border border-border-default rounded hover:bg-bg-hover transition-colors">
              编辑
            </button>
          )}
          <MoreHorizontal className="w-5 h-5 text-text-muted hover:text-text-primary cursor-pointer" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-6">
            {currentNote.path.split("/").map((seg, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className={i === arr.length - 1 ? "text-text-primary" : "text-text-tertiary"}>{seg}</span>
                {i < arr.length - 1 && <span className="text-text-muted">/</span>}
              </span>
            ))}
          </div>

          {/* Title */}
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-blue mt-1.5" />
              {currentNote.title}
            </h1>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-text-muted mb-6 flex-wrap">
            <span>创建于 {formatDate(currentNote.created)}</span>
            <span className="text-border-default">|</span>
            <span>更新于 {formatDate(currentNote.updated)}</span>
            {currentNote.tags?.map((t) => (
              <span key={t} className="px-2 py-0.5 text-[11px] text-accent-blue bg-accent-blue/15 rounded-full">#{t}</span>
            ))}
          </div>

          {/* Summary Callout */}
          {currentNote.summary && (
            <div className="bg-bg-card border-l-[3px] border-accent-purple rounded-md p-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-accent-purple" />
                <span className="text-sm font-semibold text-text-primary">摘要</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{currentNote.summary}</p>
            </div>
          )}

          {/* Content */}
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[400px] bg-bg-code border border-border-code rounded-md p-4 text-sm text-text-secondary font-mono outline-none focus:border-accent-blue resize-y"
            />
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {currentNote.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
