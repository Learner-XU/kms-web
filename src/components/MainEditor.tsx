"use client"

import { currentNote } from "@/lib/mock-data"
import { Lightbulb, X, MoreHorizontal } from "lucide-react"

const codeBlocks = [
  {
    lang: "go",
    code: `func (pl *PreFilter) PreFilter(
    ctx context.Context,
    pod *v1.Pod,
) (*framework.PreFilterResult, *framework.Status) {
    // 检查 Pod 的资源请求是否超过集群容量
    // ...
    return nil, nil
}`,
  },
  {
    lang: "go",
    code: `func (fl *Filter) Filter(
    ctx context.Context,
    state *framework.CycleState,
    pod *v1.Pod,
    nodeInfo *framework.NodeInfo,
) *framework.Status {
    // 过滤掉所有不满足条件的节点
    // 节点资源不足、污点不匹配等
    return nil
}`,
  },
]

const sections = [
  {
    num: "1",
    title: "预选策略 (PreFilter)",
    body: "在过滤之前，先检查一些条件是否满足，比如 Pod 的资源请求是否超过集群容量等，不满足则直接忽略。",
    codeBlock: 0,
  },
  {
    num: "2",
    title: "过滤策略 (Filter)",
    body: "过滤掉所有不满足条件的节点，比如节点资源不足、污点不匹配等。",
    codeBlock: 1,
  },
]

export default function MainEditor() {
  return (
    <div className="flex-1 flex flex-col h-screen bg-bg-primary overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border-divider bg-bg-sidebar">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary rounded-t text-sm text-text-primary">
          <span className="w-2 h-2 rounded-full bg-accent-blue" />
          <span>{currentNote.title}</span>
          <X className="w-3.5 h-3.5 text-text-muted hover:text-text-primary cursor-pointer" />
        </div>
        <span className="text-text-muted hover:text-text-secondary cursor-pointer px-1">+</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-6">
            {currentNote.path.split(" / ").map((seg, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className={i === arr.length - 1 ? "text-text-primary" : "text-text-tertiary"}>
                  {seg}
                </span>
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
            <MoreHorizontal className="w-5 h-5 text-text-muted hover:text-text-primary cursor-pointer mt-2" />
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-text-muted mb-6 flex-wrap">
            <span>创建于 {currentNote.created}</span>
            <span className="text-border-default">|</span>
            <span>更新于 {currentNote.updated}</span>
            <span className="text-border-default">|</span>
            <span>阅读时长 {currentNote.readTime} 分钟</span>
            {currentNote.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[11px] text-accent-blue bg-accent-blue/15 rounded-full"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Callout Block */}
          <div className="bg-bg-card border-l-[3px] border-accent-purple rounded-md p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-accent-purple" />
              <span className="text-sm font-semibold text-text-primary">核心思想</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Kubernetes 的调度机制负责将 Pod 分配到合适的 Node 上运行，主要考虑资源需求、硬件/软件/策略限制、亲和性等因素。
            </p>
          </div>

          {/* Flow Diagram */}
          <div className="bg-bg-card border border-border-code rounded-md p-6 mb-8">
            <div className="flex items-center gap-3 justify-center flex-wrap">
              {["Task", "Scheduler Cache", "PreFilter", "Filter", "Score", "Bind"].map(
                (step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`px-4 py-2 rounded-md text-xs font-medium border ${
                        step === "Task"
                          ? "bg-blue-900/40 border-blue-700 text-blue-300"
                          : step === "Scheduler Cache" || step === "Bind"
                          ? "bg-green-900/40 border-green-700 text-green-300"
                          : "bg-bg-hover border-border-default text-text-secondary"
                      }`}
                    >
                      {step}
                    </div>
                    {i < 5 && <span className="text-text-muted">→</span>}
                  </div>
                )
              )}
            </div>
            <div className="flex justify-center mt-4">
              <span className="text-text-muted text-xs">↓</span>
            </div>
            <div className="flex justify-center mt-1">
              <div className="px-6 py-2 rounded-md bg-green-900/40 border border-green-700 text-green-300 text-xs font-medium">
                Node
              </div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((sec) => (
            <div key={sec.num} className="mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                {sec.num}. {sec.title}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {sec.body}
              </p>
              <CodeBlock lang={codeBlocks[sec.codeBlock].lang} code={codeBlocks[sec.codeBlock].code} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="bg-bg-code border border-border-code rounded-md overflow-hidden">
      <div className="px-4 py-1.5 border-b border-border-code">
        <span className="text-[11px] text-text-muted font-mono">{lang}</span>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-[13px] font-mono text-text-secondary leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}
