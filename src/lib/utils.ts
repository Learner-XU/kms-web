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
