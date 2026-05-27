"use client"

import { useState } from "react"
import { X } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, path: string, type: string) => void
}

export default function NewNoteDialog({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("")
  const [path, setPath] = useState("notes/")
  const [type, setType] = useState("note")

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-bg-elevated border border-border-default rounded-xl w-[420px] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-12 border-b border-border-subtle">
              <h3 className="text-sm font-semibold text-text-primary">新建笔记</h3>
              <button onClick={onClose} className="text-text-ghost hover:text-text-tertiary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-[11px] text-text-ghost mb-1.5">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入笔记标题..."
                  className="w-full bg-bg-base border border-border-default rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-ghost outline-none focus:border-border-accent transition-colors"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <div>
                <label className="block text-[11px] text-text-ghost mb-1.5">路径</label>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="notes/"
                  className="w-full bg-bg-base border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-ghost outline-none focus:border-border-accent font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-text-ghost mb-1.5">类型</label>
                <div className="flex gap-1.5">
                  {[
                    { value: "note", label: "笔记" },
                    { value: "daily", label: "日记" },
                    { value: "source", label: "摘录" },
                    { value: "project", label: "项目" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        type === t.value
                          ? "border-border-accent bg-accent-subtle text-accent-hover"
                          : "border-border-default text-text-muted hover:text-text-tertiary hover:bg-bg-hover"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-subtle">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="px-4 py-2 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                创建
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
