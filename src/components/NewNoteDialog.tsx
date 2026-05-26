"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, path: string, type: string) => void
}

export default function NewNoteDialog({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("")
  const [path, setPath] = useState("notes/")
  const [type, setType] = useState("note")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!title.trim()) return
    const fullPath = path.endsWith("/") ? path + title.replace(/\s+/g, "-") : path
    onSubmit(title, fullPath, type)
    setTitle("")
    setPath("notes/")
    setType("note")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-card border border-border-default rounded-lg w-[420px] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-divider">
          <h3 className="text-sm font-semibold text-text-primary">新建笔记</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入笔记标题..."
              className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5">路径</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="notes/"
              className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5">类型</label>
            <div className="flex gap-2">
              {[
                { value: "note", label: "笔记" },
                { value: "daily", label: "日记" },
                { value: "source", label: "摘录" },
                { value: "project", label: "项目" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    type === t.value
                      ? "border-accent-blue bg-accent-blue/15 text-accent-blue"
                      : "border-border-default text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border-divider">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-tertiary hover:text-text-primary transition-colors">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm bg-accent-blue text-white rounded-md hover:bg-accent-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}
