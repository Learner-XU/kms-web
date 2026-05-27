"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight, Search, Plus, Folder, FolderOpen, FileText } from "lucide-react"
import { useKMSStore } from "@/lib/store"

export default function FileBrowser() {
  const { fileTree, loadNotes, loadNote, notes, search, searchResults, searchQuery, clearSearch } = useKMSStore()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState("")
  const [inputValue, setInputValue] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Auto-expand all folders when fileTree changes
  useEffect(() => {
    if (fileTree.length > 0) {
      const autoExpand: Record<string, boolean> = {}
      const walk = (nodes: typeof fileTree) => {
        for (const node of nodes) {
          if (node.type === "folder") {
            autoExpand[node.path] = true
            if (node.children) walk(node.children)
          }
        }
      }
      walk(fileTree)
      setExpanded(prev => ({ ...autoExpand, ...prev }))
    }
  }, [fileTree])

  const toggle = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  const handleSelect = (path: string) => {
    setSelected(path)
    loadNote(path)
  }

  const handleSearch = (value: string) => {
    setInputValue(value)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (value.trim()) {
      debounceRef.current = setTimeout(() => {
        search(value)
      }, 400)
    } else {
      clearSearch()
    }
  }

  return (
    <div className="w-65 min-w-65 bg-bg-sidebar border-r border-border-default flex flex-col h-screen">
      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-bg-primary border border-border-default rounded-md px-3 py-2">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索文件..."
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1"
          />
        </div>
      </div>

      {/* Tree or Search Results */}
      <div className="flex-1 overflow-y-auto px-1">
        {searchQuery ? (
          <div>
            <div className="px-3 py-2 text-xs text-text-muted">
              搜索 &quot;{searchQuery}&quot; · {searchResults.length} 结果
            </div>
            {searchResults.map((note) => (
              <div
                key={note.id}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer rounded transition-colors ${
                  selected === note.path
                    ? "bg-bg-selected text-text-primary"
                    : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"
                }`}
                onClick={() => handleSelect(note.path)}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate text-[13px]">{note.title}</span>
              </div>
            ))}
          </div>
        ) : (
          fileTree.map((node) => (
            <TreeNodeComponent
              key={node.path}
              node={node}
              depth={0}
              expanded={expanded}
              selected={selected}
              onToggle={toggle}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>

      {/* New Note Button */}
      <div className="p-3 border-t border-border-divider">
        <button onClick={() => useKMSStore.getState().setShowNewNoteDialog(true)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary border border-border-default rounded-md hover:bg-bg-hover transition-colors">
          <Plus className="w-4 h-4" />
          <span>新建笔记</span>
        </button>
      </div>
    </div>
  )
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

function TreeNodeComponent({
  node, depth, expanded, selected, onToggle, onSelect,
}: {
  node: TreeNode; depth: number; expanded: Record<string, boolean>; selected: string;
  onToggle: (path: string) => void; onSelect: (path: string) => void;
}) {
  const isFolder = node.type === "folder"
  const isExpanded = expanded[node.path]
  const isSelected = selected === node.path
  const hasChildren = node.children && node.children.length > 0

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
          isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {isFolder ? (
          isExpanded ? <FolderOpen className="w-4 h-4 text-accent-yellow shrink-0" /> : <Folder className="w-4 h-4 text-accent-yellow shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-text-muted shrink-0" />
        )}
        <span className="truncate text-[13px]">{node.name}</span>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent key={child.path} node={child} depth={depth + 1} expanded={expanded} selected={selected} onToggle={onToggle} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}
