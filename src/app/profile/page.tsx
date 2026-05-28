"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, PencilSimple, FloppyDisk, X, Plus, Trash,
  MapPin, Envelope, Phone, Globe, GithubLogo, LinkedinLogo,
  Download, Certificate, Lightning, ShoppingCart, ChartBar,
  User, Briefcase, Code, GraduationCap, Trophy,
  TwitterLogo,
} from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"

/* ── Types ── */

interface Profile {
  name: string
  title: string
  bio: string
  avatar: string
  location: string
  email: string
  phone: string
  website: string
  github: string
  linkedin: string
  twitter: string
  skills: SkillCategory[]
  experience: Experience[]
  projects: Project[]
  education: Education[]
  certificates: string[]
}

interface SkillCategory {
  category: string
  items: { name: string; level: number }[]
}

interface Experience {
  company: string
  role: string
  period: string
  type: string
  duration: string
  description: string
}

interface Project {
  name: string
  type: string
  period: string
  description: string
  tech: string[]
  icon: string
}

interface Education {
  school: string
  degree: string
  period: string
}

/* ── Storage ── */

const STORAGE_KEY = "kms_profile"

function loadProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaultProfile(), ...JSON.parse(saved) }
  } catch {}
  return defaultProfile()
}

function defaultProfile(): Profile {
  return {
    name: "", title: "", bio: "", avatar: "",
    location: "", email: "", phone: "", website: "",
    github: "", linkedin: "", twitter: "",
    skills: [], experience: [], projects: [], education: [], certificates: [],
  }
}

/* ── Nav items ── */

const navItems = [
  { key: "hero", label: "个人简介", icon: User },
  { key: "experience", label: "工作经历", icon: Briefcase },
  { key: "projects", label: "项目经历", icon: Code },
  { key: "skills", label: "技能专长", icon: Lightning },
  { key: "education", label: "教育经历", icon: GraduationCap },
  { key: "certificates", label: "证书荣誉", icon: Trophy },
]

const projectIcons: Record<string, typeof Lightning> = {
  lightning: Lightning,
  cart: ShoppingCart,
  chart: ChartBar,
  code: Code,
}

/* ── Main Page ── */

export default function ProfilePage() {
  const router = useRouter()
  const user = useKMSStore(useShallow((s) => s.user))
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Profile>(defaultProfile)
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const p = loadProfile()
    if (!p.name && user) p.name = user.nickname || user.username
    setProfile(p)
    setDraft(p)
  }, [user])

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    setProfile(draft)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(profile)
    setEditing(false)
  }

  const scrollTo = (key: string) => {
    setActiveSection(key)
    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const p = editing ? draft : profile

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base">
      {/* ── Left Sidebar ── */}
      <aside className="w-72 min-w-72 bg-bg-surface border-r border-border-default flex flex-col h-screen overflow-y-auto shrink-0">
        {/* Back + Edit */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <button onClick={() => router.back()} className="p-1.5 rounded-md text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          {editing ? (
            <div className="flex items-center gap-1">
              <button onClick={cancel} className="p-1.5 rounded-md text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors" title="取消">
                <X className="w-4 h-4" />
              </button>
              <button onClick={save} className="p-1.5 rounded-md text-accent hover:bg-accent-subtle transition-colors" title="保存">
                <FloppyDisk className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-md text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors" title="编辑">
              <PencilSimple className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center px-5 py-4">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center ring-2 ring-accent/20">
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <User weight="bold" className="w-8 h-8 text-accent/60" />
              )}
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-bg-surface bg-emerald-500" />
          </div>
          {editing ? (
            <>
              <input value={draft.avatar} onChange={(e) => setDraft({ ...draft, avatar: e.target.value })} placeholder="头像 URL" className="w-full px-2 py-1 text-[11px] bg-bg-base border border-border-default rounded outline-none focus:border-accent text-center text-text-muted mb-2" />
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full px-2 py-1 text-[15px] font-semibold bg-bg-base border border-border-default rounded outline-none focus:border-accent text-center text-text-primary mb-1.5" />
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full px-2 py-1 text-[12px] bg-bg-base border border-border-default rounded outline-none focus:border-accent text-center text-text-tertiary" />
            </>
          ) : (
            <>
              <h1 className="text-[16px] font-semibold text-text-primary">{p.name || "未设置姓名"}</h1>
              <p className="text-[12px] text-text-tertiary mt-0.5">{p.title || "未设置职称"}</p>
            </>
          )}
        </div>

        {/* Contact */}
        <div className="px-5 pb-4 space-y-2.5">
          <ContactRow editing={editing} icon={<MapPin className="w-3.5 h-3.5" />} value={p.location} draft={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} placeholder="位置" />
          <ContactRow editing={editing} icon={<Envelope className="w-3.5 h-3.5" />} value={p.email} draft={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} placeholder="邮箱" />
          <ContactRow editing={editing} icon={<Phone className="w-3.5 h-3.5" />} value={p.phone} draft={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} placeholder="电话" />
          <ContactRow editing={editing} icon={<GithubLogo className="w-3.5 h-3.5" />} value={p.github} draft={draft.github} onChange={(v) => setDraft({ ...draft, github: v })} placeholder="GitHub" />
        </div>

        {/* Social */}
        <div className="flex items-center justify-center gap-3 px-5 pb-4">
          {p.github && <a href={`https://github.com/${p.github}`} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-bg-base flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"><GithubLogo className="w-4 h-4" /></a>}
          {p.linkedin && <a href={`https://linkedin.com/in/${p.linkedin}`} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-bg-base flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"><LinkedinLogo className="w-4 h-4" /></a>}
          {p.twitter && <a href={`https://x.com/${p.twitter}`} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-bg-base flex items-center justify-center text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors"><TwitterLogo className="w-4 h-4" /></a>}
        </div>

        {/* Nav */}
        <nav className="px-3 pb-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => scrollTo(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors mb-0.5 ${
                activeSection === item.key
                  ? "bg-accent-subtle text-accent-hover font-medium"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Download */}
        <div className="px-5 pb-5 mt-auto">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">
            <Download className="w-4 h-4" />
            下载简历 (PDF)
          </button>
          <p className="text-[10px] text-text-ghost text-center mt-3">© {new Date().getFullYear()} {p.name}</p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-bg-base">
        <div className="max-w-[860px] mx-auto px-8 py-10 space-y-6">

          {/* Hero */}
          <section id="section-hero" className="bg-bg-surface border border-border-subtle rounded-2xl p-8">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className="text-accent text-[14px] mb-1">你好，我是</p>
                <h1 className="text-[32px] font-bold text-text-primary mb-2 leading-tight">{p.name || "你的名字"}</h1>
                <p className="text-accent text-[15px] mb-4">{p.title || "你的职称"}</p>
                {editing ? (
                  <textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} className="w-full px-3 py-2 text-[13px] bg-bg-base border border-border-default rounded-lg outline-none focus:border-accent resize-y min-h-[100px] text-text-secondary" placeholder="个人简介..." />
                ) : (
                  <p className="text-[14px] text-text-secondary leading-relaxed mb-6 max-w-[480px]">{p.bio || "暂无简介，点击编辑按钮添加。"}</p>
                )}
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => scrollTo("projects")} className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium bg-accent text-white rounded-full hover:bg-accent-hover transition-colors">
                    查看我的项目 →
                  </button>
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="flex items-center gap-2 px-5 py-2 text-[13px] text-text-secondary border border-border-default rounded-full hover:bg-bg-hover transition-colors">
                      <Envelope className="w-4 h-4" /> 联系我
                    </a>
                  )}
                </div>
              </div>
              {/* Decorative */}
              <div className="hidden lg:block w-[200px] h-[200px] relative opacity-60">
                <div className="w-20 h-20 rounded-2xl rotate-12 absolute top-4 left-4 bg-accent/20" />
                <div className="w-16 h-16 rounded-xl -rotate-6 absolute top-8 left-10 bg-accent/30" />
                <div className="w-3 h-3 rounded-full absolute top-2 right-4 bg-accent/40" />
                <div className="w-2 h-2 rounded-full absolute bottom-8 left-2 bg-accent/30" />
              </div>
            </div>
          </section>

          {/* Experience */}
          <section id="section-experience" className="bg-bg-surface border border-border-subtle rounded-2xl p-8">
            <SectionHeader title="工作经历" />
            <div className="relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border-subtle" />
              <div className="space-y-6">
                {(p.experience).map((exp, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full bg-accent/40 border-2 border-accent" />
                    {editing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input value={exp.role} onChange={(e) => { const a = [...draft.experience]; a[i] = { ...a[i], role: e.target.value }; setDraft({ ...draft, experience: a }) }} placeholder="职位" className="flex-1 px-3 py-1.5 text-[13px] bg-bg-base border border-border-default rounded-md outline-none focus:border-accent" />
                          <input value={exp.company} onChange={(e) => { const a = [...draft.experience]; a[i] = { ...a[i], company: e.target.value }; setDraft({ ...draft, experience: a }) }} placeholder="公司" className="flex-1 px-3 py-1.5 text-[13px] bg-bg-base border border-border-default rounded-md outline-none focus:border-accent" />
                        </div>
                        <div className="flex gap-2">
                          <input value={exp.type} onChange={(e) => { const a = [...draft.experience]; a[i] = { ...a[i], type: e.target.value }; setDraft({ ...draft, experience: a }) }} placeholder="类型" className="w-24 px-3 py-1.5 text-[13px] bg-bg-base border border-border-default rounded-md outline-none focus:border-accent" />
                          <input value={exp.period} onChange={(e) => { const a = [...draft.experience]; a[i] = { ...a[i], period: e.target.value }; setDraft({ ...draft, experience: a }) }} placeholder="时间" className="flex-1 px-3 py-1.5 text-[13px] bg-bg-base border border-border-default rounded-md outline-none focus:border-accent" />
                          <input value={exp.duration} onChange={(e) => { const a = [...draft.experience]; a[i] = { ...a[i], duration: e.target.value }; setDraft({ ...draft, experience: a }) }} placeholder="时长" className="w-24 px-3 py-1.5 text-[13px] bg-bg-base border border-border-default rounded-md outline-none focus:border-accent" />
                        </div>
                        <textarea value={exp.description} onChange={(e) => { const a = [...draft.experience]; a[i] = { ...a[i], description: e.target.value }; setDraft({ ...draft, experience: a }) }} placeholder="工作描述" className="w-full px-3 py-1.5 text-[13px] bg-bg-base border border-border-default rounded-md outline-none focus:border-accent resize-y min-h-[60px]" />
                        <button onClick={() => { const a = draft.experience.filter((_, j) => j !== i); setDraft({ ...draft, experience: a }) }} className="text-xs text-danger hover:underline">删除</button>
                      </div>
                    ) : (
                      <div className="bg-bg-base border border-border-subtle rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[14px] font-medium text-text-primary">{exp.role}</span>
                          <span className="text-text-ghost">@</span>
                          <span className="text-[14px] text-accent">{exp.company}</span>
                          {exp.type && <span className="px-2 py-0.5 text-[10px] bg-accent/10 text-accent rounded-full">{exp.type}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-text-ghost mb-2">
                          <span>{exp.period}</span>
                          {exp.duration && <span>· {exp.duration}</span>}
                        </div>
                        {exp.description && <p className="text-[13px] text-text-tertiary leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
                {p.experience.length === 0 && !editing && <p className="text-[13px] text-text-ghost pl-8">暂无工作经历，点击编辑添加。</p>}
              </div>
              {editing && (
                <button onClick={() => setDraft({ ...draft, experience: [...draft.experience, { company: "", role: "", period: "", type: "", duration: "", description: "" }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent border border-accent/30 rounded-md hover:bg-accent-subtle transition-colors mt-4 ml-8">
                  <Plus className="w-3 h-3" /> 添加经历
                </button>
              )}
            </div>
          </section>

          {/* Projects */}
          <section id="section-projects" className="bg-bg-surface border border-border-subtle rounded-2xl p-8">
            <SectionHeader title="项目经历" />
            <div className="grid grid-cols-1 gap-4">
              {(p.projects).map((proj, i) => {
                const IconComp = projectIcons[proj.icon] || Lightning
                return (
                  editing ? (
                    <div key={i} className="bg-bg-base border border-border-subtle rounded-xl p-5 space-y-2">
                      <div className="flex gap-2">
                        <input value={proj.name} onChange={(e) => { const a = [...draft.projects]; a[i] = { ...a[i], name: e.target.value }; setDraft({ ...draft, projects: a }) }} placeholder="项目名称" className="flex-1 px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                        <input value={proj.type} onChange={(e) => { const a = [...draft.projects]; a[i] = { ...a[i], type: e.target.value }; setDraft({ ...draft, projects: a }) }} placeholder="类型" className="w-24 px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                      </div>
                      <input value={proj.period} onChange={(e) => { const a = [...draft.projects]; a[i] = { ...a[i], period: e.target.value }; setDraft({ ...draft, projects: a }) }} placeholder="时间" className="w-full px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                      <textarea value={proj.description} onChange={(e) => { const a = [...draft.projects]; a[i] = { ...a[i], description: e.target.value }; setDraft({ ...draft, projects: a }) }} placeholder="项目描述" className="w-full px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent resize-y min-h-[60px]" />
                      <input value={proj.tech.join(", ")} onChange={(e) => { const a = [...draft.projects]; a[i] = { ...a[i], tech: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; setDraft({ ...draft, projects: a }) }} placeholder="技术栈 (逗号分隔)" className="w-full px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                      <button onClick={() => { const a = draft.projects.filter((_, j) => j !== i); setDraft({ ...draft, projects: a }) }} className="text-xs text-danger hover:underline">删除</button>
                    </div>
                  ) : (
                    <div key={i} className="bg-bg-base border border-border-subtle rounded-xl p-5 hover:border-accent/20 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <IconComp className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[14px] font-medium text-text-primary">{proj.name}</span>
                            {proj.type && <span className="px-2 py-0.5 text-[10px] bg-accent/10 text-accent rounded-full">{proj.type}</span>}
                          </div>
                          <span className="text-[12px] text-text-ghost block mb-2">{proj.period}</span>
                          {proj.description && <p className="text-[13px] text-text-tertiary leading-relaxed mb-3">{proj.description}</p>}
                          {proj.tech.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {proj.tech.map((t) => (
                                <span key={t} className="px-2 py-0.5 text-[11px] text-accent bg-accent/10 rounded-md">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )
              })}
              {p.projects.length === 0 && !editing && <p className="text-[13px] text-text-ghost">暂无项目数据，点击编辑添加。</p>}
            </div>
            {editing && (
              <button onClick={() => setDraft({ ...draft, projects: [...draft.projects, { name: "", type: "", period: "", description: "", tech: [], icon: "lightning" }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent border border-accent/30 rounded-md hover:bg-accent-subtle transition-colors mt-4">
                <Plus className="w-3 h-3" /> 添加项目
              </button>
            )}
          </section>

          {/* Skills */}
          <section id="section-skills" className="bg-bg-surface border border-border-subtle rounded-2xl p-8">
            <SectionHeader title="技能专长" />
            {editing ? (
              <div className="space-y-4">
                {(draft.skills).map((cat, ci) => (
                  <div key={ci} className="bg-bg-base border border-border-subtle rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <input value={cat.category} onChange={(e) => { const a = [...draft.skills]; a[ci] = { ...a[ci], category: e.target.value }; setDraft({ ...draft, skills: a }) }} placeholder="分类名称" className="flex-1 px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                      <button onClick={() => { const a = draft.skills.filter((_, j) => j !== ci); setDraft({ ...draft, skills: a }) }} className="text-danger p-1"><Trash className="w-4 h-4" /></button>
                    </div>
                    {cat.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2 mb-2">
                        <input value={item.name} onChange={(e) => { const a = [...draft.skills]; const items = [...a[ci].items]; items[ii] = { ...items[ii], name: e.target.value }; a[ci] = { ...a[ci], items }; setDraft({ ...draft, skills: a }) }} placeholder="技能名" className="flex-1 px-3 py-1 text-[12px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                        <input type="range" min={0} max={100} value={item.level} onChange={(e) => { const a = [...draft.skills]; const items = [...a[ci].items]; items[ii] = { ...items[ii], level: Number(e.target.value) }; a[ci] = { ...a[ci], items }; setDraft({ ...draft, skills: a }) }} className="w-24 accent-accent" />
                        <span className="text-[11px] text-text-ghost w-8 text-right">{item.level}%</span>
                        <button onClick={() => { const a = [...draft.skills]; const items = a[ci].items.filter((_, j) => j !== ii); a[ci] = { ...a[ci], items }; setDraft({ ...draft, skills: a }) }} className="text-text-ghost hover:text-danger"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => { const a = [...draft.skills]; a[ci] = { ...a[ci], items: [...a[ci].items, { name: "", level: 80 }] }; setDraft({ ...draft, skills: a }) }} className="text-xs text-accent hover:underline mt-1">+ 添加技能</button>
                  </div>
                ))}
                <button onClick={() => setDraft({ ...draft, skills: [...draft.skills, { category: "", items: [] }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent border border-accent/30 rounded-md hover:bg-accent-subtle transition-colors">
                  <Plus className="w-3 h-3" /> 添加分类
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {p.skills.map((cat, ci) => (
                  <div key={ci} className="bg-bg-base border border-border-subtle rounded-xl p-5">
                    <h3 className="text-[13px] font-medium text-text-primary mb-4">{cat.category}</h3>
                    <div className="space-y-3">
                      {cat.items.map((item, ii) => (
                        <div key={ii}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] text-text-secondary">{item.name}</span>
                          </div>
                          <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${item.level}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {p.skills.length === 0 && <p className="text-[13px] text-text-ghost col-span-3">暂无技能数据，点击编辑添加。</p>}
              </div>
            )}
          </section>

          {/* Education */}
          <section id="section-education" className="bg-bg-surface border border-border-subtle rounded-2xl p-8">
            <SectionHeader title="教育经历" />
            <div className="space-y-3">
              {(p.education).map((edu, i) => (
                editing ? (
                  <div key={i} className="bg-bg-base border border-border-subtle rounded-xl p-5 space-y-2">
                    <div className="flex gap-2">
                      <input value={edu.school} onChange={(e) => { const a = [...draft.education]; a[i] = { ...a[i], school: e.target.value }; setDraft({ ...draft, education: a }) }} placeholder="学校" className="flex-1 px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                      <input value={edu.degree} onChange={(e) => { const a = [...draft.education]; a[i] = { ...a[i], degree: e.target.value }; setDraft({ ...draft, education: a }) }} placeholder="学位/专业" className="flex-1 px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                    </div>
                    <input value={edu.period} onChange={(e) => { const a = [...draft.education]; a[i] = { ...a[i], period: e.target.value }; setDraft({ ...draft, education: a }) }} placeholder="时间" className="w-full px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-accent" />
                    <button onClick={() => { const a = draft.education.filter((_, j) => j !== i); setDraft({ ...draft, education: a }) }} className="text-xs text-danger hover:underline">删除</button>
                  </div>
                ) : (
                  <div key={i} className="bg-bg-base border border-border-subtle rounded-xl flex items-center gap-4 p-5">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-medium text-text-primary block">{edu.school}</span>
                      <span className="text-[13px] text-text-tertiary">{edu.degree}</span>
                    </div>
                    <span className="text-[12px] text-text-ghost shrink-0">{edu.period}</span>
                  </div>
                )
              ))}
              {p.education.length === 0 && !editing && <p className="text-[13px] text-text-ghost">暂无教育经历，点击编辑添加。</p>}
            </div>
            {editing && (
              <button onClick={() => setDraft({ ...draft, education: [...draft.education, { school: "", degree: "", period: "" }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent border border-accent/30 rounded-md hover:bg-accent-subtle transition-colors mt-4">
                <Plus className="w-3 h-3" /> 添加教育
              </button>
            )}
          </section>

          {/* Certificates */}
          <section id="section-certificates" className="bg-bg-surface border border-border-subtle rounded-2xl p-8">
            <SectionHeader title="证书荣誉" />
            {editing ? (
              <div className="space-y-2">
                {(draft.certificates).map((cert, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={cert} onChange={(e) => { const a = [...draft.certificates]; a[i] = e.target.value; setDraft({ ...draft, certificates: a }) }} className="flex-1 px-3 py-1.5 text-[13px] bg-bg-base border border-border-default rounded-md outline-none focus:border-accent" />
                    <button onClick={() => { const a = draft.certificates.filter((_, j) => j !== i); setDraft({ ...draft, certificates: a }) }} className="text-danger p-1"><Trash className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setDraft({ ...draft, certificates: [...draft.certificates, ""] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent border border-accent/30 rounded-md hover:bg-accent-subtle transition-colors">
                  <Plus className="w-3 h-3" /> 添加证书
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {p.certificates.map((cert, i) => (
                  <div key={i} className="flex items-center gap-3 bg-bg-base border border-border-subtle rounded-xl px-5 py-3">
                    <Certificate className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-[13px] text-text-secondary">{cert}</span>
                  </div>
                ))}
                {p.certificates.length === 0 && <p className="text-[13px] text-text-ghost">暂无证书数据，点击编辑添加。</p>}
              </div>
            )}
          </section>

          <div className="h-8" />
        </div>
      </main>
    </div>
  )
}

/* ── Components ── */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-[18px] font-semibold text-text-primary">{title}</h2>
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  )
}

function ContactRow({ icon, value, editing, draft, onChange, placeholder }: {
  icon: React.ReactNode; value: string; editing: boolean; draft: string;
  onChange: (v: string) => void; placeholder: string
}) {
  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-text-ghost shrink-0">{icon}</span>
        <input value={draft} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 px-2 py-1 text-[12px] bg-bg-base border border-border-default rounded outline-none focus:border-accent text-text-secondary" />
      </div>
    )
  }
  if (!value) return null
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-ghost shrink-0">{icon}</span>
      <span className="text-[12px] text-text-secondary truncate">{value}</span>
    </div>
  )
}
