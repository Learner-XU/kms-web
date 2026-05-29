"use client"

import { useState, useEffect } from "react"
import { Brain, ArrowRight, Tag, CalendarBlank, User } from "@phosphor-icons/react"
import { publishedAPI, type PublishedNote } from "@/lib/api"
import { formatDate } from "@/lib/utils"

export default function HomePage() {
  const [notes, setNotes] = useState<PublishedNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    publishedAPI
      .list(50, 0)
      .then((data) => setNotes(data.notes || []))
      .catch((e) => {
        console.error("Failed to load published notes:", e)
        setError("加载失败，请稍后重试")
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/80 backdrop-blur-xl">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-accent-muted flex items-center justify-center">
              <Brain weight="fill" className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[15px] font-semibold text-text-primary group-hover:text-accent transition-colors">
              Second Brain
            </span>
          </a>
          <a
            href="/app"
            className="text-[13px] text-text-tertiary hover:text-accent transition-colors"
          >
            进入工作台 →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[960px] mx-auto px-6 pt-16 pb-12">
        <h1 className="text-[32px] font-bold text-text-primary tracking-tight">
          公开笔记
        </h1>
        <p className="mt-3 text-[15px] text-text-tertiary leading-relaxed max-w-[560px]">
          这里是我整理和发布的公开笔记，涵盖技术、思考和日常记录。
        </p>
      </section>

      {/* Notes List */}
      <main className="max-w-[960px] mx-auto px-6 pb-20">
        {loading ? (
          <div className="flex items-center gap-3 py-20 justify-center">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] text-text-ghost">加载中...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-[15px] text-text-ghost">{error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[15px] text-text-ghost">还没有发布任何笔记</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notes.map((note) => (
              <a
                key={note.slug}
                href={`/p/${note.slug}`}
                className="group flex items-start gap-5 px-5 py-5 rounded-xl hover:bg-bg-hover transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-[16px] font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
                    {note.title || note.slug}
                  </h2>
                  {note.summary && (
                    <p className="mt-1.5 text-[13px] text-text-tertiary leading-relaxed line-clamp-2">
                      {note.summary}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-4 text-[12px] text-text-ghost">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {note.nickname || note.username}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarBlank className="w-3 h-3" />
                      {formatDate(note.published_at)}
                    </span>
                    {note.tags && note.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {note.tags.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-ghost group-hover:text-accent group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle">
        <div className="max-w-[960px] mx-auto px-6 py-6 flex items-center justify-between text-[12px] text-text-ghost">
          <span>Powered by Second Brain</span>
          <a href="/p" className="hover:text-accent transition-colors">
            查看全部 →
          </a>
        </div>
      </footer>
    </div>
  )
}
