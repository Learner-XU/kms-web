"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, Tag, User, CalendarBlank, ArrowRight } from "@phosphor-icons/react"
import { publishedAPI, type PublishedNote } from "@/lib/api"
import { formatDate } from "@/lib/utils"

export default function PublishedNotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<PublishedNote[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    publishedAPI
      .list(100, 0)
      .then((data) => {
        setNotes(data.notes)
        setTotal(data.total)
      })
      .catch((e) => console.error("Failed to load published notes:", e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-text-ghost">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-base min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[22px] font-bold text-text-primary flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-accent" />
            发布笔记
          </h1>
          <p className="text-[13px] text-text-ghost mt-1.5">
            {total > 0 ? `共 ${total} 篇公开笔记` : "暂无已发布的笔记"}
          </p>
        </div>

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-text-ghost">
            <FileText className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-[14px]">暂无已发布的笔记</p>
            <p className="text-[12px] mt-1 opacity-60">笔记发布后将在此处展示</p>
          </div>
        )}

        {/* Note list */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.slug}
              onClick={() => router.push(`/p/${note.slug}`)}
              className="group bg-bg-surface border border-border-subtle rounded-xl p-5 cursor-pointer hover:border-border-default hover:bg-bg-elevated transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-[16px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                    {note.title}
                  </h2>

                  {note.summary && (
                    <p className="text-[13px] text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                      {note.summary.length > 160
                        ? note.summary.slice(0, 160) + "…"
                        : note.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {/* Author */}
                    <span className="flex items-center gap-1 text-[11px] text-text-ghost">
                      <User className="w-3.5 h-3.5" />
                      {note.nickname || note.username}
                    </span>

                    {/* Date */}
                    <span className="flex items-center gap-1 text-[11px] text-text-ghost">
                      <CalendarBlank className="w-3.5 h-3.5" />
                      {formatDate(note.published_at)}
                    </span>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-text-ghost" />
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[10px] text-accent bg-accent-subtle rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-[10px] text-text-ghost">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-text-ghost group-hover:text-accent transition-colors shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
