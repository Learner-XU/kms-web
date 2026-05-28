"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus, X, Check, ChatCircle, Tag, Clock,
  CircleDashed, CheckCircle, CaretDown, MagnifyingGlass,
  ArrowClockwise,
} from "@phosphor-icons/react"
import { issuesAPI, type Issue, type IssueLabel } from "@/lib/api"

export default function TasksView() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [labels, setLabels] = useState<IssueLabel[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open")
  const [labelFilter, setLabelFilter] = useState<string>("")
  const [showCreate, setShowCreate] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showLabels, setShowLabels] = useState(false)

  const loadIssues = useCallback(async () => {
    setLoading(true)
    try {
      const state = filter === "all" ? "all" : filter
      const res = await issuesAPI.list(state, labelFilter || undefined)
      setIssues(res.issues || [])
    } catch (e) {
      console.error("Failed to load issues:", e)
    }
    setLoading(false)
  }, [filter, labelFilter])

  const loadLabels = useCallback(async () => {
    try {
      const res = await issuesAPI.listLabels()
      setLabels(res.labels || [])
    } catch {}
  }, [])

  useEffect(() => { loadIssues() }, [loadIssues])
  useEffect(() => { loadLabels() }, [loadLabels])

  const handleToggleState = async (issue: Issue) => {
    const newState = issue.state === "open" ? "closed" : "open"
    try {
      await issuesAPI.update(issue.number, { state: newState })
      loadIssues()
      if (selectedIssue?.number === issue.number) {
        setSelectedIssue(null)
      }
    } catch {}
  }

  const openCount = issues.filter(i => i.state === "open").length
  const closedCount = issues.filter(i => i.state === "closed").length

  return (
    <div className="flex-1 flex h-screen bg-bg-base overflow-hidden">
      {/* Main list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-border-subtle bg-bg-surface shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-[15px] font-semibold text-text-primary">任务看板</h2>
            <div className="flex items-center gap-1 text-[12px]">
              <button onClick={() => setFilter("open")} className={`px-2.5 py-1 rounded-md transition-colors ${filter === "open" ? "bg-accent-subtle text-accent" : "text-text-ghost hover:text-text-secondary"}`}>
                <CircleDashed className="w-3.5 h-3.5 inline mr-1" />{openCount} 待办
              </button>
              <button onClick={() => setFilter("closed")} className={`px-2.5 py-1 rounded-md transition-colors ${filter === "closed" ? "bg-accent-subtle text-accent" : "text-text-ghost hover:text-text-secondary"}`}>
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" />{closedCount} 已完成
              </button>
              <button onClick={() => setFilter("all")} className={`px-2.5 py-1 rounded-md transition-colors ${filter === "all" ? "bg-accent-subtle text-accent" : "text-text-ghost hover:text-text-secondary"}`}>
                全部
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Label filter */}
            <div className="relative">
              <button onClick={() => setShowLabels(!showLabels)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-text-ghost border border-border-default rounded-lg hover:bg-bg-hover transition-colors">
                <Tag className="w-3.5 h-3.5" />
                {labelFilter || "标签筛选"}
                {labelFilter && <X className="w-3 h-3 ml-1 hover:text-danger" onClick={(e) => { e.stopPropagation(); setLabelFilter(""); setShowLabels(false) }} />}
                <CaretDown className="w-3 h-3" />
              </button>
              {showLabels && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-bg-elevated border border-border-default rounded-lg shadow-xl py-1 z-50 max-h-60 overflow-y-auto">
                  <button onClick={() => { setLabelFilter(""); setShowLabels(false) }} className="w-full px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-hover text-left">全部标签</button>
                  {labels.map(l => (
                    <button key={l.id} onClick={() => { setLabelFilter(l.name); setShowLabels(false) }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-hover text-left">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: `#${l.color}` }} />
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={loadIssues} className="p-1.5 text-text-ghost hover:text-text-secondary hover:bg-bg-hover rounded-md transition-colors" title="刷新">
              <ArrowClockwise className="w-4 h-4" />
            </button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">
              <Plus className="w-3.5 h-3.5" /> 新建任务
            </button>
          </div>
        </div>

        {/* Issue list */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-[13px] text-text-ghost">加载中...</span>
            </div>
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <CheckCircle className="w-8 h-8 text-text-ghost mb-2" />
              <span className="text-[13px] text-text-ghost">
                {filter === "open" ? "没有待办任务" : filter === "closed" ? "没有已完成任务" : "暂无任务"}
              </span>
              {filter === "open" && (
                <button onClick={() => setShowCreate(true)} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-accent border border-accent/30 rounded-lg hover:bg-accent-subtle transition-colors">
                  <Plus className="w-3.5 h-3.5" /> 创建第一个任务
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-w-[800px] mx-auto">
              {issues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => setSelectedIssue(issue)}
                  onToggle={() => handleToggleState(issue)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedIssue && (
        <IssueDetailPanel
          issue={selectedIssue}
          labels={labels}
          onClose={() => setSelectedIssue(null)}
          onToggle={() => handleToggleState(selectedIssue)}
          onRefresh={loadIssues}
        />
      )}

      {/* Create dialog */}
      {showCreate && (
        <CreateIssueDialog
          labels={labels}
          onClose={() => setShowCreate(false)}
          onCreate={async (title, body, selectedLabels) => {
            await issuesAPI.create({ title, body, labels: selectedLabels })
            setShowCreate(false)
            loadIssues()
          }}
        />
      )}
    </div>
  )
}

/* ── Issue Card ── */

function IssueCard({ issue, onClick, onToggle }: { issue: Issue; onClick: () => void; onToggle: () => void }) {
  const isOpen = issue.state === "open"
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 bg-bg-surface border border-border-subtle rounded-xl hover:border-accent/20 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        className="mt-0.5 shrink-0"
        title={isOpen ? "标记完成" : "重新打开"}
      >
        {isOpen ? (
          <CircleDashed className="w-5 h-5 text-text-ghost group-hover:text-accent transition-colors" />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-medium text-text-primary truncate">{issue.title}</span>
          <span className="text-[11px] text-text-ghost shrink-0">#{issue.number}</span>
        </div>
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {issue.labels.map(l => (
              <span key={l.id} className="px-2 py-0.5 text-[10px] rounded-full" style={{ background: `#${l.color}20`, color: `#${l.color}`, border: `1px solid #${l.color}40` }}>
                {l.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 text-[11px] text-text-ghost">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(issue.created_at)}</span>
          {issue.comments > 0 && <span className="flex items-center gap-1"><ChatCircle className="w-3 h-3" />{issue.comments}</span>}
        </div>
      </div>
    </div>
  )
}

/* ── Detail Panel ── */

function IssueDetailPanel({ issue, labels: allLabels, onClose, onToggle, onRefresh }: {
  issue: Issue; labels: IssueLabel[]; onClose: () => void; onToggle: () => void; onRefresh: () => void
}) {
  const [comments, setComments] = useState<{ id: number; body: string; created_at: string; user: { login: string } }[]>([])
  const [newComment, setNewComment] = useState("")
  const [loadingComments, setLoadingComments] = useState(true)

  useEffect(() => {
    setLoadingComments(true)
    issuesAPI.listComments(issue.number)
      .then(res => setComments(res.comments || []))
      .catch(() => {})
      .finally(() => setLoadingComments(false))
  }, [issue.number])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await issuesAPI.addComment(issue.number, newComment)
      setNewComment("")
      const res = await issuesAPI.listComments(issue.number)
      setComments(res.comments || [])
      onRefresh()
    } catch {}
  }

  const isOpen = issue.state === "open"

  return (
    <div className="w-[400px] min-w-[400px] border-l border-border-subtle bg-bg-surface flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-border-subtle shrink-0">
        <span className="text-[13px] font-medium text-text-secondary">#{issue.number}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg transition-colors ${
              isOpen ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-accent-subtle text-accent hover:bg-accent/20"
            }`}
          >
            {isOpen ? <><Check className="w-3.5 h-3.5" /> 标记完成</> : <><ArrowClockwise className="w-3.5 h-3.5" /> 重新打开</>}
          </button>
          <button onClick={onClose} className="p-1.5 text-text-ghost hover:text-text-secondary hover:bg-bg-hover rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="text-[16px] font-semibold text-text-primary mb-2">{issue.title}</h3>
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {issue.labels.map(l => (
              <span key={l.id} className="px-2.5 py-0.5 text-[11px] rounded-full" style={{ background: `#${l.color}20`, color: `#${l.color}`, border: `1px solid #${l.color}40` }}>
                {l.name}
              </span>
            ))}
          </div>
        )}
        {issue.body && (
          <div className="text-[13px] text-text-secondary leading-relaxed mb-6 whitespace-pre-wrap bg-bg-base rounded-lg p-4 border border-border-subtle">
            {issue.body}
          </div>
        )}

        <div className="flex items-center gap-4 text-[11px] text-text-ghost mb-6">
          <span>创建于 {formatDate(issue.created_at)}</span>
          <span>更新于 {formatDate(issue.updated_at)}</span>
        </div>

        {/* Comments */}
        <div className="border-t border-border-subtle pt-4">
          <h4 className="text-[13px] font-medium text-text-secondary mb-3">评论 ({comments.length})</h4>
          {loadingComments ? (
            <p className="text-[12px] text-text-ghost">加载中...</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="bg-bg-base rounded-lg p-3 border border-border-subtle">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[12px] font-medium text-accent">{c.user.login}</span>
                    <span className="text-[10px] text-text-ghost">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-[12px] text-text-secondary whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-[12px] text-text-ghost">暂无评论</p>}
            </div>
          )}
        </div>
      </div>

      {/* Comment input */}
      <div className="border-t border-border-subtle p-4 shrink-0">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="添加评论..."
          className="w-full px-3 py-2 text-[13px] bg-bg-base border border-border-default rounded-lg outline-none focus:border-accent resize-none min-h-[60px] text-text-secondary"
        />
        <div className="flex justify-end mt-2">
          <button onClick={handleAddComment} disabled={!newComment.trim()} className="px-4 py-1.5 text-[12px] font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Create Dialog ── */

function CreateIssueDialog({ labels: allLabels, onClose, onCreate }: {
  labels: IssueLabel[]; onClose: () => void; onCreate: (title: string, body: string, labels: string[]) => Promise<void>
}) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onCreate(title, body, selectedLabels)
    } catch {}
    setSubmitting(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[520px] bg-bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h3 className="text-[14px] font-semibold text-text-primary">新建任务</h3>
          <button onClick={onClose} className="p-1 text-text-ghost hover:text-text-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] text-text-ghost mb-1 block">标题 *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="任务标题..."
              className="w-full px-3 py-2 text-[13px] bg-bg-base border border-border-default rounded-lg outline-none focus:border-accent text-text-primary"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[11px] text-text-ghost mb-1 block">描述</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="任务描述..."
              className="w-full px-3 py-2 text-[13px] bg-bg-base border border-border-default rounded-lg outline-none focus:border-accent resize-y min-h-[80px] text-text-secondary"
            />
          </div>
          {allLabels.length > 0 && (
            <div>
              <label className="text-[11px] text-text-ghost mb-1.5 block">标签</label>
              <div className="flex flex-wrap gap-1.5">
                {allLabels.map(l => {
                  const selected = selectedLabels.includes(l.name)
                  return (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLabels(selected ? selectedLabels.filter(s => s !== l.name) : [...selectedLabels, l.name])}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full transition-colors"
                      style={{
                        background: selected ? `#${l.color}30` : "transparent",
                        color: selected ? `#${l.color}` : undefined,
                        border: `1px solid #${l.color}60`,
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: `#${l.color}` }} />
                      {l.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-subtle">
          <button onClick={onClose} className="px-4 py-1.5 text-[12px] text-text-ghost border border-border-default rounded-lg hover:bg-bg-hover transition-colors">取消</button>
          <button onClick={handleSubmit} disabled={!title.trim() || submitting} className="px-4 py-1.5 text-[12px] font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? "创建中..." : "创建任务"}
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Helpers ── */

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "刚刚"
    if (mins < 60) return `${mins} 分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} 小时前`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} 天前`
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })
  } catch {
    return dateStr
  }
}
