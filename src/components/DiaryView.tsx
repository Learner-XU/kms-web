"use client"

import { useState, useEffect } from "react"
import { CaretLeft, CaretRight, Plus, FileText, Calendar, Clock } from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"

export default function DiaryView() {
  const { notes, notesLoading, loadNote, loadNotes, createNote, setActiveView } = useKMSStore(
    useShallow((s) => ({
      notes: s.notes, notesLoading: s.notesLoading, loadNote: s.loadNote,
      loadNotes: s.loadNotes, createNote: s.createNote, setActiveView: s.setActiveView,
    }))
  )
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [creating, setCreating] = useState(false)

  useEffect(() => { loadNotes() }, [loadNotes])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const diaryNotes = notes.filter((n) => n.type === "daily")

  const getNoteForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return diaryNotes.find((n) => n.path.includes(dateStr))
  }

  const handleDayClick = async (day: number) => {
    const note = getNoteForDay(day)
    if (note) {
      loadNote(note.path)
      setActiveView("notes")
    }
  }

  const handleCreateToday = async () => {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    const title = `${dateStr} 日记`
    const path = `daily/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${dateStr}`

    // Check if today's diary already exists
    const existing = diaryNotes.find(n => n.path.includes(dateStr))
    if (existing) {
      loadNote(existing.path)
      setActiveView("notes")
      return
    }

    setCreating(true)
    try {
      await createNote(title, path, "daily")
      await loadNotes()
      // Load the newly created note
      setTimeout(() => {
        const newNote = useKMSStore.getState().notes.find(n => n.path.includes(dateStr))
        if (newNote) {
          loadNote(newNote.path)
          setActiveView("notes")
        }
      }, 500)
    } catch (e) {
      console.error("Failed to create diary:", e)
    }
    setCreating(false)
  }

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const monthName = currentMonth.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })

  // Recent diary entries
  const recentDiaries = [...diaryNotes]
    .sort((a, b) => b.path.localeCompare(a.path))
    .slice(0, 10)

  return (
    <div className="flex-1 flex h-screen bg-bg-base overflow-hidden">
      {/* Main calendar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 h-14 border-b border-border-subtle bg-bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1 hover:bg-bg-hover rounded-md transition-colors">
              <CaretLeft className="w-4 h-4 text-text-tertiary" />
            </button>
            <h2 className="text-sm font-semibold text-text-primary">{monthName}</h2>
            <button onClick={nextMonth} className="p-1 hover:bg-bg-hover rounded-md transition-colors">
              <CaretRight className="w-4 h-4 text-text-tertiary" />
            </button>
          </div>
          <button
            onClick={handleCreateToday}
            disabled={creating}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{creating ? "创建中..." : "今日日记"}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[700px] mx-auto">
            <div className="grid grid-cols-7 gap-px mb-1">
              {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
                <div key={d} className="text-center text-[10px] text-text-ghost py-2 font-medium">{d}</div>
              ))}
            </div>

            {notesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px">
                {days.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} className="aspect-square" />

                  const note = getNoteForDay(day)
                  const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`aspect-square border rounded-lg p-2 cursor-pointer transition-colors ${
                        isToday
                          ? "border-accent bg-accent-subtle"
                          : note
                          ? "border-border-default hover:border-accent/30"
                          : "border-border-subtle hover:border-border-default hover:bg-bg-hover"
                      }`}
                    >
                      <div className={`text-[13px] ${isToday ? "text-accent font-semibold" : note ? "text-text-secondary" : "text-text-ghost"}`}>
                        {day}
                      </div>
                      {note && (
                        <div className="mt-1">
                          <FileText className="w-3 h-3 text-accent" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent entries sidebar */}
      <div className="w-72 min-w-72 border-l border-border-subtle bg-bg-surface flex flex-col h-screen overflow-hidden">
        <div className="flex items-center gap-2 px-5 h-12 border-b border-border-subtle shrink-0">
          <Clock className="w-4 h-4 text-text-ghost" />
          <span className="text-[13px] font-medium text-text-secondary">最近日记</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {recentDiaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Calendar className="w-6 h-6 text-text-ghost mb-2" />
              <span className="text-[12px] text-text-ghost">暂无日记</span>
              <button onClick={handleCreateToday} className="mt-2 text-[11px] text-accent hover:underline">
                写今天的第一篇日记
              </button>
            </div>
          ) : (
            recentDiaries.map(note => (
              <button
                key={note.path}
                onClick={() => { loadNote(note.path); setActiveView("notes") }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] text-text-primary truncate block">{note.title}</span>
                  <span className="text-[10px] text-text-ghost">{note.path.split("/").pop()?.replace(".md", "")}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
