"use client"

import LeftNav from "@/components/LeftNav"
import FileBrowser from "@/components/FileBrowser"
import MainEditor from "@/components/MainEditor"
import RightSidebar from "@/components/RightSidebar"
import GraphView from "@/components/GraphView"
import DiaryView from "@/components/DiaryView"
import NewNoteDialog from "@/components/NewNoteDialog"
import { useKMSStore } from "@/lib/store"

export default function Home() {
  const { activeView, createNote, error, clearError, notes, fileTree, notesLoading, showNewNoteDialog, setShowNewNoteDialog } = useKMSStore()

  const handleCreateNote = async (title: string, path: string, type: string) => {
    await createNote(title, path, type)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-900/90 text-red-200 px-4 py-3 rounded-md text-sm flex items-center gap-3 shadow-lg">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-200 font-bold">×</button>
        </div>
      )}
      {/* Debug Info (remove in production) */}
      <div className="fixed bottom-2 right-2 z-50 text-[10px] text-text-muted bg-bg-card/80 px-2 py-1 rounded">
        notes:{notes.length} tree:{fileTree.length} loading:{notesLoading ? 'Y' : 'N'} view:{activeView}
      </div>
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
      {activeView === "tasks" && (
        <div className="flex-1 flex items-center justify-center bg-bg-primary">
          <div className="text-center text-text-muted">
            <p className="text-lg mb-2">任务看板</p>
            <p className="text-sm">对接 Gitea Issues API，开发中...</p>
          </div>
        </div>
      )}
      {activeView === "ai" && (
        <div className="flex-1 flex items-center justify-center bg-bg-primary">
          <div className="text-center text-text-muted">
            <p className="text-lg mb-2">AI 助手</p>
            <p className="text-sm">预留功能，后续接入...</p>
          </div>
        </div>
      )}

      <NewNoteDialog
        isOpen={showNewNoteDialog}
        onClose={() => setShowNewNoteDialog(false)}
        onSubmit={handleCreateNote}
      />
    </div>
  )
}
