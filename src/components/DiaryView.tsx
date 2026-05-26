"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, FileText } from "lucide-react"
import { useKMSStore } from "@/lib/store"

export default function DiaryView() {
  const { notes, loadNotes, loadNote } = useKMSStore()
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
    if (note) {
      loadNote(note.path)
    }
  }

  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const monthName = currentMonth.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })

  return (
    <div className="flex-1 flex flex-col h-screen bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-divider">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-1 hover:bg-bg-hover rounded transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-tertiary" />
          </button>
          <h2 className="text-lg font-semibold text-text-primary">{monthName}</h2>
          <button onClick={nextMonth} className="p-1 hover:bg-bg-hover rounded transition-colors">
            <ChevronRight className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary border border-border-default rounded-md hover:bg-bg-hover transition-colors">
          <Plus className="w-4 h-4" />
          <span>今日日记</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[900px] mx-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
              <div key={d} className="text-center text-xs text-text-muted py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />
              }
              const note = getNoteForDay(day)
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square border rounded-md p-2 cursor-pointer transition-colors ${
                    isToday
                      ? "border-accent-blue bg-accent-blue/10"
                      : note
                      ? "border-border-default bg-bg-card hover:border-accent-blue"
                      : "border-border-divider hover:border-border-default hover:bg-bg-hover"
                  }`}
                >
                  <div className={`text-sm ${isToday ? "text-accent-blue font-semibold" : "text-text-tertiary"}`}>
                    {day}
                  </div>
                  {note && (
                    <div className="mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-accent-blue" />
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
