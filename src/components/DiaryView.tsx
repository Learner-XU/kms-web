"use client"

import { useState } from "react"
import { CaretLeft, CaretRight, Plus, FileText } from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"

export default function DiaryView() {
  const { notes, loadNote } = useKMSStore(
    useShallow((s) => ({ notes: s.notes, loadNote: s.loadNote }))
  )
  const [currentMonth, setCurrentMonth] = useState(new Date())

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

  const handleDayClick = (day: number) => {
    const note = getNoteForDay(day)
    if (note) loadNote(note.path)
  }

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const monthName = currentMonth.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })

  return (
    <div className="flex-1 flex flex-col h-screen bg-bg-base overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1 hover:bg-bg-hover rounded-md transition-colors">
            <CaretLeft className="w-4 h-4 text-text-tertiary" />
          </button>
          <h2 className="text-sm font-semibold text-text-primary">{monthName}</h2>
          <button onClick={nextMonth} className="p-1 hover:bg-bg-hover rounded-md transition-colors">
            <CaretRight className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary border border-border-default rounded-lg hover:bg-bg-hover active:scale-[0.98] transition-all">
          <Plus className="w-3.5 h-3.5" />
          <span>今日日记</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[900px] mx-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
              <div key={d} className="text-center text-[10px] text-text-ghost py-2 font-medium">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="aspect-square" />

              const note = getNoteForDay(day)
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square border rounded-lg p-2.5 cursor-pointer transition-colors ${
                    isToday
                      ? "border-border-accent bg-accent-subtle"
                      : note
                      ? "border-border-default hover:border-border-accent"
                      : "border-border-subtle hover:border-border-default hover:bg-bg-hover"
                  }`}
                >
                  <div className={`text-[13px] ${isToday ? "text-accent font-semibold" : "text-text-tertiary"}`}>
                    {day}
                  </div>
                  {note && (
                    <div className="mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-accent" />
                      <span className="text-[10px] text-text-muted truncate">{note.title}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
