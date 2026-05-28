"use client"

import { useState, useEffect } from "react"
import LeftNav from "@/components/LeftNav"
import FileBrowser from "@/components/FileBrowser"
import MainEditor from "@/components/MainEditor"
import RightSidebar from "@/components/RightSidebar"
import GraphView from "@/components/GraphView"
import DiaryView from "@/components/DiaryView"
import TasksView from "@/components/TasksView"
import HistoryPanel from "@/components/HistoryPanel"
import StatsView from "@/components/StatsView"
import NewNoteDialog from "@/components/NewNoteDialog"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"
import { motion, AnimatePresence } from "motion/react"
import { X, List, TreeStructure } from "@phosphor-icons/react"
import { useIsMobile } from "@/lib/useIsMobile"

export default function Home() {
  const { activeView, createNote, error, clearError, showNewNoteDialog, setShowNewNoteDialog, showHistory, setShowHistory, currentNote } = useKMSStore(
    useShallow((s) => ({
      activeView: s.activeView, createNote: s.createNote, error: s.error, clearError: s.clearError,
      showNewNoteDialog: s.showNewNoteDialog, setShowNewNoteDialog: s.setShowNewNoteDialog,
      showHistory: s.showHistory, setShowHistory: s.setShowHistory,
      currentNote: s.currentNote,
    }))
  )

  const { ready, isMobile } = useIsMobile()
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [browserCollapsed, setBrowserCollapsed] = useState(false)
  // Mobile panel: which overlay is open
  const [mobilePanel, setMobilePanel] = useState<"nav" | "browser" | null>(null)

  // Keyboard shortcuts (desktop only)
  useEffect(() => {
    if (!ready || isMobile) return
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "\\") { e.preventDefault(); setNavCollapsed((v) => !v) }
      if (e.metaKey && e.key === "b") { e.preventDefault(); setBrowserCollapsed((v) => !v) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [ready, isMobile])

  // Close mobile panel when switching view
  useEffect(() => { setMobilePanel(null) }, [activeView])

  // Load notes on mount (needed for mobile where FileBrowser doesn't mount by default)
  const loadNotes = useKMSStore((s) => s.loadNotes)
  useEffect(() => { if (ready) loadNotes() }, [ready, loadNotes])

  // Don't render layout until we know the screen size (avoids flash)
  if (!ready) {
    return <div className="h-screen w-screen bg-bg-base" />
  }

  const handleCreateNote = async (title: string, path: string, type: string) => {
    await createNote(title, path, type)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base">
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-danger/10 border border-danger/20 text-text-secondary px-4 py-3 rounded-lg text-sm backdrop-blur-sm"
          >
            <span>{error}</span>
            <button onClick={clearError} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay: LeftNav */}
      {isMobile && mobilePanel === "nav" && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setMobilePanel(null)}
          />
          <motion.div
            initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed left-0 top-0 z-50 h-screen shadow-xl"
          >
            <LeftNav collapsed={false} onToggle={() => setMobilePanel(null)} />
          </motion.div>
        </>
      )}

      {/* Mobile overlay: FileBrowser */}
      {isMobile && mobilePanel === "browser" && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setMobilePanel(null)}
          />
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed left-0 top-0 z-50 h-screen shadow-xl"
          >
            <FileBrowser collapsed={false} onToggle={() => setMobilePanel(null)} />
          </motion.div>
        </>
      )}

      {/* Desktop layout */}
      {!isMobile && <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((v) => !v)} />}

      {/* Mobile global header — always visible so user can navigate */}
      {isMobile && activeView !== "notes" && (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <MobileHeader
            onOpenNav={() => setMobilePanel("nav")}
            onOpenBrowser={() => setMobilePanel("browser")}
          />
          {activeView === "graph" && <GraphView />}
          {activeView === "diary" && <DiaryView />}
          {activeView === "tasks" && <TasksView />}
          {activeView === "ai" && <StatsView onNoteClick={(path) => { useKMSStore.getState().loadNote(path); useKMSStore.getState().setActiveView("notes") }} />}
        </div>
      )}

      {activeView === "notes" && (
        <>
          {!isMobile && <FileBrowser collapsed={browserCollapsed} onToggle={() => setBrowserCollapsed((v) => !v)} />}
          {isMobile ? (
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              <MobileHeader
                onOpenNav={() => setMobilePanel("nav")}
                onOpenBrowser={() => setMobilePanel("browser")}
              />
              <MainEditor />
            </div>
          ) : (
            <MainEditor />
          )}
          <RightSidebar />
          {showHistory && currentNote && <HistoryPanel notePath={currentNote.path} onClose={() => setShowHistory(false)} />}
        </>
      )}

      {/* Desktop-only views */}
      {!isMobile && activeView === "graph" && <GraphView />}
      {!isMobile && activeView === "diary" && <DiaryView />}
      {!isMobile && activeView === "tasks" && <TasksView />}
      {!isMobile && activeView === "ai" && <StatsView onNoteClick={(path) => { useKMSStore.getState().loadNote(path); useKMSStore.getState().setActiveView("notes") }} />}

      <NewNoteDialog
        isOpen={showNewNoteDialog}
        onClose={() => setShowNewNoteDialog(false)}
        onSubmit={handleCreateNote}
      />
    </div>
  )
}

function MobileHeader({ onOpenNav, onOpenBrowser }: { onOpenNav: () => void; onOpenBrowser: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 h-11 bg-bg-surface border-b border-border-subtle shrink-0">
      <button onClick={onOpenNav} className="w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:bg-bg-hover transition-colors">
        <List className="w-5 h-5" />
      </button>
      <button onClick={onOpenBrowser} className="w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:bg-bg-hover transition-colors">
        <TreeStructure className="w-5 h-5" />
      </button>
      <div className="flex-1" />
    </div>
  )
}

