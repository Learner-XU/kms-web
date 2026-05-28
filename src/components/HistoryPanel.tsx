"use client"

import { useState, useEffect } from "react"
import { Clock, GitCommit, X } from "@phosphor-icons/react"
import { notesAPI } from "@/lib/api"
import { formatRelativeTime } from "@/lib/utils"

interface Commit {
  sha: string
  message: string
  created: string
  author: { name: string }
}

export default function HistoryPanel({ notePath, onClose }: { notePath: string; onClose: () => void }) {
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!notePath) return
    setLoading(true)
    notesAPI.history(notePath)
      .then(res => setCommits(res.commits || []))
      .catch(() => setCommits([]))
      .finally(() => setLoading(false))
  }, [notePath])

  return (
    <div className="w-80 min-w-80 border-l border-border-subtle bg-bg-surface flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between px-4 h-12 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-ghost" />
          <span className="text-[13px] font-medium text-text-secondary">版本历史</span>
        </div>
        <button onClick={onClose} className="p-1 text-text-ghost hover:text-text-secondary hover:bg-bg-hover rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-[12px] text-text-ghost">加载中...</span>
          </div>
        ) : commits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <GitCommit className="w-6 h-6 text-text-ghost mb-2" />
            <span className="text-[12px] text-text-ghost">暂无历史记录</span>
          </div>
        ) : (
          <div className="py-2">
            {commits.map((commit, i) => (
              <div key={commit.sha} className="flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors cursor-pointer">
                <div className="relative flex flex-col items-center mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/40 shrink-0" />
                  {i < commits.length - 1 && <div className="w-px flex-1 bg-border-subtle mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-text-primary leading-relaxed line-clamp-2">{commit.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-text-ghost">
                    <span>{commit.author.name}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(commit.created)}</span>
                  </div>
                  <span className="text-[10px] text-text-ghost font-mono">{commit.sha.substring(0, 7)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

