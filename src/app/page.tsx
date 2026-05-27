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

export default function Home() {
  const { activeView, createNote } = useKMSStore()
  const [showNewNote, setShowNewNote] = useState(false)

  const handleCreateNote = async (title: string, path: string, type: string) => {
    await createNote(title, path, type)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
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
        isOpen={showNewNote}
        onClose={() => setShowNewNote(false)}
        onSubmit={handleCreateNote}
      />
    </div>
  )
}
