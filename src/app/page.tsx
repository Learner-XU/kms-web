"use client"

import { useState } from "react"
import LeftNav from "@/components/LeftNav"
import FileBrowser from "@/components/FileBrowser"
import MainEditor from "@/components/MainEditor"
import RightSidebar from "@/components/RightSidebar"
import GraphView from "@/components/GraphView"
import DiaryView from "@/components/DiaryView"
import NewNoteDialog from "@/components/NewNoteDialog"
import { useKMSStore } from "@/lib/store"
import { motion, AnimatePresence } from "motion/react"
import { X } from "@phosphor-icons/react"

export default function Home() {
  const { activeView, createNote, error, clearError, showNewNoteDialog, setShowNewNoteDialog } = useKMSStore()

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

      <LeftNav />
      {activeView === "notes" && (
        <>
          <FileBrowser />
          <MainEditor />
          <RightSidebar />
        </>
      )}
      {activeView === "graph" && <GraphView />}
      {activeView === "diary" && <DiaryView />}
      {activeView === "tasks" && <EmptyState title="任务看板" description="对接 Gitea Issues，规划中" />}
      {activeView === "ai" && <EmptyState title="AI 助手" description="预留功能，后续接入" />}

      <NewNoteDialog
        isOpen={showNewNoteDialog}
        onClose={() => setShowNewNoteDialog(false)}
        onSubmit={handleCreateNote}
      />
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg-base">
      <div className="text-center">
        <p className="text-lg font-medium text-text-secondary mb-1">{title}</p>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
    </div>
  )
}
