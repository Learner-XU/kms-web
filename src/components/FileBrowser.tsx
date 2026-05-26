"use client"

import { useState } from "react"
import {
  ChevronDown, ChevronRight, Search, Plus,
  Folder, FolderOpen,
} from "lucide-react"
import { fileTree, TreeNode } from "@/lib/mock-data"

export default function FileBrowser() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    kubernetes: true,
    "kubernetes/scheduling": true,
  })
  const [selected, setSelected] = useState("kubernetes/scheduling")

  const toggle = (path: string) =>
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }))

  return (
    <div className="w-65 min-w-65 bg-bg-sidebar border-r border-border-default flex flex-col h-screen">
      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-bg-primary border border-border-default rounded-md px-3 py-2">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索文件..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-1">
        {fileTree.map((node) => (
          <TreeNodeComponent
            key={node.path}
            node={node}
            depth={0}
            expanded={expanded}
            selected={selected}
            onToggle={toggle}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* New Note Button */}
      <div className="p-3 border-t border-border-divider">
        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary border border-border-default rounded-md hover:bg-bg-hover transition-colors">
          <Plus className="w-4 h-4" />
          <span>新建笔记</span>
        </button>
      </div>
    </div>
  )
}

function TreeNodeComponent({
  node,
  depth,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  node: TreeNode
  depth: number
  expanded: Record<string, boolean>
  selected: string
  onToggle: (path: string) => void
  onSelect: (path: string) => void
}) {
  const isFolder = node.type === "folder" || (node.children && node.children.length > 0)
  const isExpanded = expanded[node.path]
  const isSelected = selected === node.path
  const hasSubChildren = node.children && node.children.length > 0

  const selectedCls = isSelected
    ? "bg-bg-selected text-text-primary border-l-2 border-accent-blue"
    : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 text-sm cursor-pointer rounded transition-colors ${selectedCls}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => {
          if (isFolder) onToggle(node.path)
          onSelect(node.path)
        }}
      >
        {isFolder ? (
          isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-accent-yellow shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-accent-yellow shrink-0" />
          )
        ) : null}
        <span className="truncate text-[13px]">{node.name}</span>
      </div>
      {isExpanded && hasSubChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
