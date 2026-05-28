export function formatDate(d: string, options?: { month?: "short" | "long"; day?: "numeric" | "2-digit" }) {
  try {
    return new Date(d).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: options?.month ?? "short",
      day: options?.day ?? "numeric",
    })
  } catch {
    return d
  }
}

/** Relative time formatting (e.g. "3分钟前", "2天前") */
export function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "刚刚"
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}天前`
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })
  } catch {
    return dateStr
  }
}
