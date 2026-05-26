// Mock data for the knowledge management system

export interface Note {
  id: string
  title: string
  path: string
  content: string
  tags: string[]
  type: string
  status: string
  created: string
  updated: string
  readTime: number
  source?: string
}

export interface TreeNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: TreeNode[]
  isExpanded?: boolean
}

export interface BackLink {
  id: string
  title: string
}

export interface Activity {
  time: string
  action: string
}

export const currentNote: Note = {
  id: "01HYK3F8N2M",
  title: "Kubernetes 调度机制",
  path: "Engineering / DevOps / Kubernetes / Kubernetes 调度机制",
  content: "",
  tags: ["Kubernetes", "调度器", "架构"],
  type: "concept",
  status: "mature",
  created: "2024-05-10",
  updated: "2024-05-18",
  readTime: 12,
  source: "官方文档",
}

export const fileTree: TreeNode[] = [
  {
    name: "Kubernetes",
    path: "kubernetes",
    type: "folder",
    isExpanded: true,
    children: [
      { name: "Kubernetes 架构概述", path: "kubernetes/arch-overview", type: "file" },
      {
        name: "Kubernetes 调度机制",
        path: "kubernetes/scheduling",
        type: "file",
        children: [
          { name: "调度器架构", path: "kubernetes/scheduling/arch", type: "file" },
          { name: "调度策略", path: "kubernetes/scheduling/strategy", type: "file" },
          { name: "优先级与抢占", path: "kubernetes/scheduling/priority", type: "file" },
          { name: "调度器扩展", path: "kubernetes/scheduling/extension", type: "file" },
        ],
      },
    ],
  },
  { name: "Docker", path: "docker", type: "folder" },
  { name: "Linux", path: "linux", type: "folder" },
  { name: "Prometheus", path: "prometheus", type: "folder" },
]

export const backLinks: BackLink[] = [
  { id: "1", title: "K8s 架构概述" },
  { id: "2", title: "调度器架构" },
  { id: "3", title: "调度策略概览" },
]

export const relatedNotes: BackLink[] = [
  { id: "1", title: "优先级与抢占" },
  { id: "2", title: "调度器扩展" },
  { id: "3", title: "K8s 资源管理" },
]

export const activities: Activity[] = [
  { time: "5分钟前", action: "编辑正文" },
  { time: "2小时前", action: "创建笔记" },
  { time: "昨天", action: "添加评论" },
]

export const spaces = [
  {
    name: "工程",
    key: "engineering",
    isExpanded: true,
    children: ["Backend", "DevOps", "数据库", "AI & ML"],
  },
  { name: "研究", key: "research", isExpanded: false, children: [] },
  { name: "生活", key: "life", isExpanded: false, children: [] },
  { name: "创业", key: "startup", isExpanded: false, children: [] },
]

export const collections = [
  { name: "最近编辑", icon: "clock", count: 18 },
  { name: "稍后阅读", icon: "bookmark", count: 7 },
  { name: "高频引用", icon: "star", count: 23 },
  { name: "灵感收集", icon: "lightbulb", count: 15 },
]

export const tags = ["Go", "Kubernetes", "分布式系统", "微服务", "设计模式", "AI"]

export const workspaces = [
  { name: "Home", icon: "home" },
  { name: "笔记", icon: "file-text", active: true },
  { name: "日记", icon: "calendar" },
  { name: "图谱", icon: "network" },
  { name: "任务", icon: "check-square" },
  { name: "AI 助手", icon: "bot" },
]
