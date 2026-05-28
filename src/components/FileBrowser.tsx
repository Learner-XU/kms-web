"use client"

import { useState, useEffect, useRef, useMemo, memo } from "react"
import {
  CaretDown, CaretRight, MagnifyingGlass, Plus, Folder, FolderOpen, FileText, Sidebar,
  Note, FolderPlus, Trash,
} from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { motion, AnimatePresence } from "motion/react"

interface TreeNode {
  name: string
  path: string       // stripped display path (no notes/ prefix)
  realPath: string   // original path for API calls
  type: "file" | "folder"
  children?: TreeNode[]
}

const ROOT_PREFIX = "notes/";

function buildFileTree(notes: { path: string; title: string }[]): TreeNode[] {
  const root: TreeNode[] = [];
  const dirMap = new Map<string, TreeNode>();

  for (const note of notes) {
    // Strip ALL leading "notes/" prefixes (handles legacy double-prefixed paths)
    let rawPath = note.path;
    while (rawPath.startsWith(ROOT_PREFIX)) {
      rawPath = rawPath.slice(ROOT_PREFIX.length);
    }
    const parts = rawPath.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (i === parts.length - 1) {
        const fileNode: TreeNode = { name: note.title, path: rawPath, realPath: note.path, type: "file" };
        if (parentPath && dirMap.has(parentPath)) {
          dirMap.get(parentPath)!.children = dirMap.get(parentPath)!.children || [];
          dirMap.get(parentPath)!.children!.push(fileNode);
        } else {
          root.push(fileNode);
        }
      } else {
        if (!dirMap.has(currentPath)) {
          const dirNode: TreeNode = { name: part, path: currentPath, realPath: ROOT_PREFIX + currentPath, type: "folder", children: [] };
          dirMap.set(currentPath, dirNode);
          if (parentPath && dirMap.has(parentPath)) {
            dirMap.get(parentPath)!.children!.push(dirNode);
          } else {
            root.push(dirNode);
          }
        }
      }
    }
  }

  return root;
}

/** Derive the parent directory from a selected path (stripped, no ROOT_PREFIX) */
function getParentDir(selectedPath: string, notes: { path: string }[]): string {
  if (!selectedPath) return ""
  // If selected path is a folder (exists as prefix in other paths), use it
  const realSelected = ROOT_PREFIX + selectedPath
  const isFolder = notes.some((n) => n.path.startsWith(realSelected + "/"))
  if (isFolder) return selectedPath
  // Otherwise use its parent
  const parts = selectedPath.split("/")
  parts.pop()
  return parts.join("/")
}

interface FileBrowserProps {
  collapsed: boolean
  onToggle: () => void
}

export default function FileBrowser({ collapsed, onToggle }: FileBrowserProps) {
  const { notes, loadNotes, loadNote, createNote, search, searchResults, searchQuery, clearSearch } = useKMSStore(
    useShallow((s) => ({
      notes: s.notes, loadNotes: s.loadNotes, loadNote: s.loadNote, createNote: s.createNote,
      search: s.search, searchResults: s.searchResults, searchQuery: s.searchQuery, clearSearch: s.clearSearch,
    }))
  )
  const fileTree = useMemo(() => buildFileTree(notes), [notes])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState("")
  const [inputValue, setInputValue] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Inline creation state
  const [creating, setCreating] = useState<"file" | "folder" | null>(null)
  const [createName, setCreateName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<{ total: number; done: number } | null>(null)
  const createInputRef = useRef<HTMLInputElement>(null)
  const suppressBlurRef = useRef(false)

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
      setExpanded(prev => {
        const newEntries: Record<string, boolean> = {}
        for (const key of Object.keys(autoExpand)) {
          if (!(key in prev)) {
            newEntries[key] = true
          }
        }
        if (Object.keys(newEntries).length === 0) return prev
        return { ...prev, ...newEntries }
      })
    }
  }, [notes])

  // Focus the create input when it appears
  useEffect(() => {
    if (creating) {
      setTimeout(() => createInputRef.current?.focus(), 50)
    }
  }, [creating])

  const toggle = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  const handleSelect = (path: string, realPath: string) => {
    setSelected(path)
    loadNote(realPath)
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

  const startCreate = (type: "file" | "folder") => {
    if (collapsed) {
      onToggle() // expand first
    }
    setCreating(type)
    setCreateName("")
    setSubmitting(false)
  }

  const handleCreateSubmit = async () => {
    if (!createName.trim() || !creating || submitting) return
    const parentDir = getParentDir(selected, notes)
    // Sanitize: replace spaces with dashes, strip slashes
    const name = createName.trim().replace(/\s+/g, "-").replace(/\//g, "")
    if (!name) return
    setSubmitting(true)
    try {
      if (creating === "folder") {
        const folderPath = `${parentDir}/${name}`
        await createNote(createName.trim(), ROOT_PREFIX + `${folderPath}/README`, "project")
      } else {
        const fullPath = `${parentDir}/${name}`
        await createNote(createName.trim(), ROOT_PREFIX + fullPath, "note")
      }
      await loadNotes()
      // Expand parent and new folder
      setExpanded((prev) => ({ ...prev, [parentDir]: true }))
      if (creating === "folder") {
        const folderPath = `${parentDir}/${name}`
        setExpanded((prev) => ({ ...prev, [folderPath]: true }))
      }
      // Success — close input
      setCreating(null)
      setCreateName("")
    } catch {
      // Keep input open so user can retry or fix
      setSubmitting(false)
    }
  }

  const cancelCreate = () => {
    if (suppressBlurRef.current) {
      suppressBlurRef.current = false
      return
    }
    if (submitting) return
    setCreating(null)
    setCreateName("")
  }

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodePath: string; nodeType: "file" | "folder" } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, nodePath: string, nodeType: "file" | "folder") => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, nodePath, nodeType })
  }

  const contextCreate = (type: "file" | "folder") => {
    if (!contextMenu) return
    suppressBlurRef.current = true
    setSelected(contextMenu.nodePath)
    if (contextMenu.nodeType === "folder") {
      setExpanded((prev) => ({ ...prev, [contextMenu.nodePath]: true }))
    }
    setContextMenu(null)
    setCreating(type)
    setCreateName("")
    setSubmitting(false)
  }

  // Helper: strip all ROOT_PREFIX occurrences from a path
  const stripPrefix = (p: string) => {
    while (p.startsWith(ROOT_PREFIX)) p = p.slice(ROOT_PREFIX.length)
    return p
  }

  const handleDelete = async (nodePath: string, nodeType: "file" | "folder") => {
    setContextMenu(null)
    if (nodeType === "folder") {
      const currentNotes = useKMSStore.getState().notes
      const children = currentNotes.filter((n) => stripPrefix(n.path).startsWith(nodePath + "/"))
      if (children.length === 0) return
      const ok = confirm(`删除文件夹 "${nodePath}"？\n包含 ${children.length} 篇笔记，此操作不可撤销。`)
      if (!ok) return
      setDeleting({ total: children.length, done: 0 })
      let failed = 0
      for (let i = 0; i < children.length; i++) {
        try { await useKMSStore.getState().deleteNote(children[i].path) } catch { failed++ }
        setDeleting({ total: children.length, done: i + 1 })
      }
      setDeleting(null)
      if (failed > 0) alert(`${failed}/${children.length} 篇笔记删除失败`)
    } else {
      const currentNotes = useKMSStore.getState().notes
      const note = currentNotes.find((n) => stripPrefix(n.path) === nodePath)
      if (!note) return
      const ok = confirm(`删除笔记 "${note.title}"？\n此操作不可撤销。`)
      if (!ok) return
      try { await useKMSStore.getState().deleteNote(note.path) } catch { /* store shows error */ }
    }
    await loadNotes()
  }

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [contextMenu])

  // Clamp context menu position to viewport
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!contextMenu) return
    const el = menuRef.current
    if (!el) { setMenuPos({ x: contextMenu.x, y: contextMenu.y }); return }
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const x = contextMenu.x + rect.width > vw ? vw - rect.width - 4 : contextMenu.x
    const y = contextMenu.y + rect.height > vh ? vh - rect.height - 4 : contextMenu.y
    setMenuPos({ x: Math.max(0, x), y: Math.max(0, y) })
  }, [contextMenu])

  // Collapsed: thin strip
  if (collapsed) {
    return (
      <div className="w-10 min-w-10 bg-bg-surface border-r border-border-default flex flex-col items-center h-screen overflow-hidden py-3 gap-2">
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"
          title="展开文件列表 (⌘B)"
        >
          <Sidebar className="w-4 h-4" />
        </button>
        <div className="w-6 border-t border-border-subtle my-1" />
        <button
          onClick={() => startCreate("file")}
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"
          title="新建笔记"
        >
          <Note className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => startCreate("folder")}
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"
          title="新建文件夹"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-64 min-w-64 bg-bg-surface border-r border-border-default flex flex-col h-screen relative">
      {/* Header: search + action icons */}
      <div className="px-3 py-3 shrink-0 space-y-2">
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
        {/* Action bar: VSCode-style icons, right-aligned */}
        <div className="flex items-center gap-0.5 justify-end">
          <button
            onClick={() => startCreate("file")}
            className="w-6 h-6 rounded flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"
            title="新建笔记"
          >
            <Note className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => startCreate("folder")}
            className="w-6 h-6 rounded flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"
            title="新建文件夹"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggle}
            className="w-6 h-6 rounded flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"
            title="收起 (⌘B)"
          >
            <Sidebar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree or Search Results */}
      <div className="flex-1 overflow-y-auto px-1.5">
        {/* Deleting progress */}
        <AnimatePresence>
          {deleting && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-2 py-2 mb-1"
            >
              <div className="text-[11px] text-text-muted mb-1.5">
                正在删除 {deleting.done}/{deleting.total}...
              </div>
              <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden">
                <div
                  className="h-full bg-danger rounded-full transition-all duration-200"
                  style={{ width: `${(deleting.done / deleting.total) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline create input */}
        <AnimatePresence>
          {creating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center gap-1.5 px-2 py-1 mx-1 mb-0.5 rounded-md bg-accent-subtle/30 border border-border-accent/30"
                style={{ paddingLeft: "8px" }}
              >
                {creating === "folder" ? (
                  <Folder weight="fill" className="w-3.5 h-3.5 shrink-0 text-warning" />
                ) : (
                  <FileText className="w-3.5 h-3.5 shrink-0 text-text-ghost" />
                )}
                <input
                  ref={createInputRef}
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSubmit()
                    if (e.key === "Escape") cancelCreate()
                  }}
                  onBlur={cancelCreate}
                  placeholder={creating === "folder" ? "文件夹名称..." : "笔记标题..."}
                  className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-ghost outline-none min-w-0"
                />
              </div>
              <div className="px-3 py-1 text-[10px] text-text-ghost">
                路径: <span className="font-mono">{getParentDir(selected, notes)}/</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    selected === stripPrefix(note.path)
                      ? "bg-accent-subtle text-accent-hover"
                      : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
                  }`}
                  onClick={() => handleSelect(stripPrefix(note.path), note.path)}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0 text-text-ghost" />
                  <span className="truncate">{note.title}</span>
                </div>
              ))
            )}
          </div>
        ) : fileTree.length === 0 && !creating ? (
          <div className="px-3 py-12 text-center">
            <Folder className="w-8 h-8 text-text-ghost mx-auto mb-3" />
            <p className="text-sm text-text-muted mb-1">还没有笔记</p>
            <p className="text-xs text-text-ghost">点击上方按钮创建第一篇</p>
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
              onContextMenu={handleContextMenu}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 bg-bg-elevated border border-border-default rounded-lg shadow-xl py-1 min-w-[160px]"
            ref={menuRef}
            style={{ left: menuPos.x, top: menuPos.y }}
          >
            {contextMenu.nodeType === "folder" && (
              <>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-text-secondary hover:bg-bg-hover transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); contextCreate("file") }}
                >
                  <Note className="w-3.5 h-3.5 text-text-ghost" />
                  新建笔记
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-text-secondary hover:bg-bg-hover transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); contextCreate("folder") }}
                >
                  <FolderPlus className="w-3.5 h-3.5 text-text-ghost" />
                  新建文件夹
                </button>
                <div className="my-1 border-t border-border-subtle" />
              </>
            )}
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleDelete(contextMenu.nodePath, contextMenu.nodeType) }}
            >
              <Trash className="w-3.5 h-3.5" />
              删除
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const TreeNodeComponent = memo(function TreeNodeComponent({
  node, depth, expanded, selected, onToggle, onSelect, onContextMenu,
}: {
  node: TreeNode; depth: number; expanded: Record<string, boolean>; selected: string;
  onToggle: (path: string) => void; onSelect: (path: string, realPath: string) => void;
  onContextMenu: (e: React.MouseEvent, nodePath: string, nodeType: "file" | "folder") => void;
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
          if (isFolder) {
            onToggle(node.path)
          } else {
            onSelect(node.path, node.realPath)
          }
        }}
        onContextMenu={(e) => onContextMenu(e, node.path, isFolder ? "folder" : "file")}
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
                onContextMenu={onContextMenu}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
