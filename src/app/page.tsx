"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Brain, ArrowRight, Tag, CalendarBlank, User,
  MagnifyingGlass, Moon, Rss, GithubLogo,
  LinkedinLogo, EnvelopeSimple, Note, Books,
} from "@phosphor-icons/react"
import { publishedAPI, type PublishedNote } from "@/lib/api"
import { formatDate } from "@/lib/utils"

export default function HomePage() {
  const [notes, setNotes] = useState<PublishedNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    publishedAPI
      .list(100, 0)
      .then((data) => setNotes(data.notes || []))
      .catch((e) => {
        console.error("Failed to load published notes:", e)
        setError("加载失败，请稍后重试")
      })
      .finally(() => setLoading(false))
  }, [])

  // Aggregate stats from notes
  const stats = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((n) => n.tags?.forEach((t) => tagSet.add(t)))
    return {
      notes: notes.length,
      tags: tagSet.size,
    }
  }, [notes])

  // Aggregate tags with counts
  const tagCounts = useMemo(() => {
    const map = new Map<string, number>()
    notes.forEach((n) => n.tags?.forEach((t) => map.set(t, (map.get(t) || 0) + 1)))
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
  }, [notes])

  // Latest notes (newest 4)
  const latestNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 4)
  }, [notes])

  // Filter notes by search
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.summary?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }, [notes, searchQuery])

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/80 backdrop-blur-xl">
        <div className="max-w-[1120px] mx-auto px-6 h-14 flex items-center gap-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-accent-muted flex items-center justify-center">
              <Brain weight="fill" className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[15px] font-semibold text-text-primary">Second Brain</span>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "首页", href: "/" },
              { label: "笔记", href: "#notes" },
              { label: "标签", href: "#tags" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] text-text-tertiary hover:text-text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg bg-bg-elevated border border-border-default w-[260px]">
            <MagnifyingGlass className="w-3.5 h-3.5 text-text-ghost" />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-ghost outline-none"
            />
            <kbd className="text-[10px] text-text-ghost bg-bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>

          {/* Actions */}
          <a
            href="/app"
            className="text-[12px] text-text-ghost hover:text-accent transition-colors"
            title="进入工作台"
          >
            工作台 →
          </a>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="max-w-[1120px] mx-auto px-6 pt-20 pb-16">
        <div className="flex items-start gap-16">
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[40px] font-bold leading-tight tracking-tight">
              <span className="text-text-primary">记录思考，构建知识</span>
              <br />
              <span className="text-text-secondary">探索技术，理解世界</span>
            </h1>
            <p className="mt-5 text-[15px] text-text-tertiary leading-relaxed max-w-[480px]">
              这里是我的数字花园，记录着我的学习、研究与思考。
              <br />
              希望这些知识能为你带来启发与帮助。
            </p>
            <div className="mt-8 flex items-center gap-3">
              <a
                href="#notes"
                className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-accent text-[13px] font-medium text-white hover:bg-accent-hover transition-colors"
              >
                浏览所有笔记
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            {/* Stats */}
            <div className="mt-10 flex items-center gap-8">
              {[
                { icon: Note, value: stats.notes, label: "公开笔记" },
                { icon: Tag, value: stats.tags, label: "标签分类" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <s.icon className="w-4 h-4 text-text-ghost" />
                  <span className="text-[20px] font-bold text-text-primary">{s.value}</span>
                  <span className="text-[13px] text-text-tertiary">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: decorative cube */}
          <div className="hidden lg:block shrink-0 w-[320px] h-[320px] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-2xl bg-accent/20 border border-accent/30 backdrop-blur-sm rotate-12 animate-pulse" />
              <div className="absolute w-24 h-24 rounded-xl bg-accent/10 border border-accent/20 -rotate-6" />
              <div className="absolute w-16 h-16 rounded-lg bg-accent/30 rotate-45" />
              {/* Orbiting dots */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-2 h-2 rounded-full bg-accent/60"
                  style={{
                    transform: `rotate(${deg}deg) translateX(140px) rotate(-${deg}deg)`,
                  }}
                />
              ))}
              {/* Labels */}
              <span className="absolute top-4 right-4 text-[11px] text-text-ghost">Research</span>
              <span className="absolute bottom-8 right-2 text-[11px] text-text-ghost">Note</span>
              <span className="absolute bottom-4 left-8 text-[11px] text-text-ghost">Knowledge</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Notes ── */}
      <section id="notes" className="max-w-[1120px] mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-text-primary">最新笔记</h2>
          <a href="/p" className="text-[13px] text-accent hover:text-accent-hover transition-colors">
            查看全部 →
          </a>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-16 justify-center">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] text-text-ghost">加载中...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-[15px] text-text-ghost">{error}</p>
          </div>
        ) : latestNotes.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[15px] text-text-ghost">还没有发布任何笔记</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestNotes.map((note) => (
              <a
                key={note.slug}
                href={`/p/${note.slug}`}
                className="group bg-bg-elevated rounded-xl border border-border-subtle overflow-hidden hover:border-accent/30 transition-all"
              >
                {/* Card header gradient */}
                <div className="h-32 bg-gradient-to-br from-accent/10 via-bg-elevated to-bg-surface relative">
                  {note.tags && note.tags[0] && (
                    <span className="absolute top-3 left-3 text-[11px] px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                      #{note.tags[0]}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                    {note.title || note.slug}
                  </h3>
                  {note.summary && (
                    <p className="mt-2 text-[12px] text-text-tertiary leading-relaxed line-clamp-2">
                      {note.summary}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-text-ghost">
                    <span className="flex items-center gap-1">
                      <CalendarBlank className="w-3 h-3" />
                      {formatDate(note.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {note.nickname || note.username}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ── All Notes (search results) ── */}
      {searchQuery && filteredNotes.length > 0 && (
        <section className="max-w-[1120px] mx-auto px-6 pb-16">
          <h2 className="text-[20px] font-bold text-text-primary mb-6">
            搜索结果 ({filteredNotes.length})
          </h2>
          <div className="space-y-1">
            {filteredNotes.map((note) => (
              <a
                key={note.slug}
                href={`/p/${note.slug}`}
                className="group flex items-start gap-5 px-5 py-4 rounded-xl hover:bg-bg-hover transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors">
                    {note.title || note.slug}
                  </h3>
                  {note.summary && (
                    <p className="mt-1 text-[12px] text-text-tertiary line-clamp-1">{note.summary}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-text-ghost">
                    <span>{formatDate(note.published_at)}</span>
                    {note.tags?.slice(0, 3).map((t) => (
                      <span key={t} className="text-accent/60">#{t}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-ghost group-hover:text-accent mt-1 shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Popular Tags ── */}
      {tagCounts.length > 0 && (
        <section id="tags" className="max-w-[1120px] mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-bold text-text-primary">热门标签</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tagCounts.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-[12px] text-text-secondary hover:border-accent/30 hover:text-accent transition-colors"
              >
                <span>#{tag}</span>
                <span className="text-[11px] font-medium text-text-ghost">{count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-border-subtle">
        <div className="max-w-[1120px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-accent-muted flex items-center justify-center">
                  <Brain weight="fill" className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[15px] font-semibold text-text-primary">Second Brain</span>
              </div>
              <p className="text-[13px] text-text-tertiary leading-relaxed">
                记录思考，构建知识，探索技术，理解世界。
                <br />
                一个程序员的数字花园 🌱
              </p>
              <div className="mt-4 flex items-center gap-3">
                {[
                  { icon: GithubLogo, href: "https://github.com/Learner-XU", label: "GitHub" },
                  { icon: EnvelopeSimple, href: "mailto:xht_pub@163.com", label: "Email" },
                  { icon: Rss, href: "/p", label: "RSS" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-ghost hover:text-accent hover:bg-accent-muted transition-colors"
                    title={s.label}
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-[13px] font-medium text-text-tertiary mb-4">快速导航</h3>
              <div className="space-y-2.5">
                {[
                  { label: "笔记", href: "#notes" },
                  { label: "标签", href: "#tags" },
                  { label: "工作台", href: "/app" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block text-[13px] text-text-secondary hover:text-accent transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Recent */}
            <div>
              <h3 className="text-[13px] font-medium text-text-tertiary mb-4">最近更新</h3>
              <div className="space-y-2.5">
                {latestNotes.slice(0, 3).map((note) => (
                  <a
                    key={note.slug}
                    href={`/p/${note.slug}`}
                    className="flex items-start gap-2 text-[13px] text-text-secondary hover:text-accent transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    <span className="line-clamp-1">{note.title || note.slug}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 pt-6 border-t border-border-subtle text-center">
            <p className="text-[12px] text-text-ghost">
              © 2024 Second Brain. Powered by KMS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
