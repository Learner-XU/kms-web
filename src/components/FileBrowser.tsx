"use client"

import { useState, useEffect, useRef } from "react"
import { CaretDown, CaretRight, MagnifyingGlass, Plus, Folder, FolderOpen, FileText } from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { motion, AnimatePresence } from "motion/react"

export default function FileBrowser() {
  const { fileTree, loadNotes, loadNote, search, searchResults, searchQuery, clearSearch } = useKMSStore()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState("")
  const [inputValue, setInputValue] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

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
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim()) {
      debounceRef.current = setTimeout(() => search(value), 300)
    } else {
      clearSearch()
    }
  }

  return (
    <div className="w-64 min-w-64 bg-bg-surface border-r border-border-default flex flex-col h-screen">
      {/* Search */}
      <div className="px-3 py-3 shrink-0">
        <div className="flex items-center gap-2 bg-bg-base border border-border-default rounded-lg px-3 py-2 focus-within:border-border-accent transition-colors">
          <MagnifyingGlass className="w-3.5 h-3.5 text-text-ghost" />
          <input
            type="text"
            placeholder="搜索..."
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent text-[13px] text-text-primary placeholder:text-text-ghost outline-none flex-1"
          />
        </div>
      </div>

      {/* Tree or Search Results */}
      <div className="flex-1 overflow-y-auto px-1.5">
        {searchQuery ? (
          <div>
            <div className="px-3 py-2 text-[11px] text-text-ghost">
              &quot;{searchQuery}&quot; · {searchResults.length} 条结果
            </div>
            {searchResults.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-text-muted">没有找到匹配的笔记</p>
              </div>
            ) : (
              searchResults.map((note) => (
                <div
                  key={note.id}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[13px] cursor-pointer rounded-md transition-colors ${
                    selected === note.path
                      ? "bg-accent-subtle text-accent-hover"
                      : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
                  }`}
                  onClick={() => handleSelect(note.path)}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0 text-text-ghost" />
                  <span className="truncate">{note.title}</span>
                </div>
              ))
            )}
          </div>
        ) : fileTree.length === 0 ? (
          <div className="px-3 py-12 text-center">
            <Folder className="w-8 h-8 text-text-ghost mx-auto mb-3" />
            <p className="text-sm text-text-muted mb-1">还没有笔记</p>
            <p className="text-xs text-text-ghost">点击下方按钮创建第一篇</p>
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
      <div className="px-3 py-3 border-t border-border-subtle shrink-0">
        <button
          onClick={() => useKMSStore.getState().setShowNewNoteDialog(true)}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-[13px] font-medium text-text-secondary bg-bg-elevated border border-border-default rounded-lg hover:bg-bg-hover hover:border-border-emphasis active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>新建笔记</span>
        </button>
      </div>
    </div>
  )
}

interface TreeNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: TreeNode[]
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

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 text-[13px] cursor-pointer rounded-md transition-colors ${
          isSelected
            ? "bg-accent-subtle text-accent-hover"
            : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => {
          if (isFolder) onToggle(node.path)
          onSelect(node.path)
        }}
      >
        {isFolder ? (
          isExpanded ? <CaretDown className="w-3 h-3 shrink-0 text-text-ghost" /> : <CaretRight className="w-3 h-3 shrink-0 text-text-ghost" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {isFolder ? (
          isExpanded
            ? <FolderOpen weight="fill" className="w-3.5 h-3.5 shrink-0 text-warning" />
            : <Folder weight="fill" className="w-3.5 h-3.5 shrink-0 text-warning" />
        ) : (
          <FileText className="w-3.5 h-3.5 shrink-0 text-text-ghost" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      <AnimatePresence>
        {isExpanded && node.children && node.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
