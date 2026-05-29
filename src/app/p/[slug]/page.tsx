"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, CalendarBlank, Tag, Clock } from "@phosphor-icons/react"
import { publishedAPI, type PublishedDetail } from "@/lib/api"
import { formatDate } from "@/lib/utils"

export default function PublishedNotePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [note, setNote] = useState<PublishedDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    publishedAPI
      .get(slug)
      .then(setNote)
      .catch((e) => {
        console.error("Failed to load published note:", e)
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

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

  if (notFound || !note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-base min-h-screen gap-4">
        <p className="text-[16px] text-text-secondary">笔记不存在或已取消发布</p>
        <button
          onClick={() => router.push("/p")}
          className="flex items-center gap-1.5 text-[13px] text-accent hover:text-accent-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回笔记列表
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-base min-h-screen">
      <div className="max-w-[720px] mx-auto px-6 py-10">
        {/* Back link */}
        <button
          onClick={() => router.push("/p")}
          className="flex items-center gap-1.5 text-[12px] text-text-ghost hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回笔记列表
        </button>

        {/* Title */}
        <h1 className="text-[24px] font-bold text-text-primary leading-tight">
          {note.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
            <User className="w-3.5 h-3.5 text-text-ghost" />
            {note.nickname || note.username}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
            <CalendarBlank className="w-3.5 h-3.5 text-text-ghost" />
            发布于 {formatDate(note.published_at)}
          </span>
          {note.updated_at && note.updated_at !== note.published_at && (
            <span className="flex items-center gap-1.5 text-[12px] text-text-ghost">
              <Clock className="w-3.5 h-3.5" />
              更新于 {formatDate(note.updated_at)}
            </span>
          )}
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-text-ghost" />
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[11px] text-accent bg-accent-subtle rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Summary callout */}
        {note.summary && (
          <div className="mt-6 p-4 bg-accent-subtle border border-accent/20 rounded-xl">
            <p className="text-[13px] text-text-secondary leading-relaxed italic">
              {note.summary}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border-subtle my-6" />

        {/* Content */}
        <article className="text-[15px] text-text-primary leading-[1.85] whitespace-pre-wrap break-words">
          {note.content}
        </article>

        {/* Footer */}
        <div className="border-t border-border-subtle mt-10 pt-6">
          <p className="text-[11px] text-text-ghost text-center">
            {note.updated_at && note.updated_at !== note.published_at
              ? `最后更新于 ${formatDate(note.updated_at, { month: "long", day: "2-digit" })}`
              : `发布于 ${formatDate(note.published_at, { month: "long", day: "2-digit" })}`}
          </p>
        </div>
      </div>
    </div>
  )
}
