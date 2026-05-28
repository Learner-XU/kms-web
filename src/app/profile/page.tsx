"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, PencilSimple, FloppyDisk, X, Plus, Trash, MapPin, Envelope, Phone, Globe, GithubLogo, LinkedinLogo } from "@phosphor-icons/react"
import { useKMSStore } from "@/lib/store"
import { useShallow } from "zustand/react/shallow"

interface Profile {
  name: string
  title: string
  bio: string
  location: string
  email: string
  phone: string
  website: string
  github: string
  linkedin: string
  skills: string[]
  experience: Experience[]
  education: Education[]
}

interface Experience {
  company: string
  role: string
  period: string
  description: string
}

interface Education {
  school: string
  degree: string
  period: string
}

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
    name: "", title: "", bio: "", location: "", email: "", phone: "",
    website: "", github: "", linkedin: "",
    skills: [], experience: [], education: [],
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const user = useKMSStore(useShallow((s) => s.user))
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Profile>(defaultProfile)

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

  return (
    <div className="flex-1 flex flex-col h-screen bg-bg-base overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 h-12 border-b border-border-subtle bg-bg-surface shrink-0">
        <button onClick={() => router.back()} className="p-1.5 rounded-md text-text-ghost hover:text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[13px] font-medium text-text-secondary">个人简历</span>
        <div className="flex-1" />
        {editing ? (
          <div className="flex items-center gap-1.5">
            <button onClick={cancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-tertiary border border-border-default rounded-md hover:bg-bg-hover transition-colors">
              <X className="w-3 h-3" /> 取消
            </button>
            <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">
              <FloppyDisk className="w-3 h-3" /> 保存
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-tertiary border border-border-default rounded-md hover:bg-bg-hover transition-colors">
            <PencilSimple className="w-3 h-3" /> 编辑
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-4 md:px-8 py-8">
          {/* Basic Info */}
          <Section title="基本信息">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="姓名" value={profile.name} editing={editing} draft={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
              <Field label="职称/角色" value={profile.title} editing={editing} draft={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
            </div>
            <Field label="个人简介" value={profile.bio} editing={editing} draft={draft.bio} onChange={(v) => setDraft({ ...draft, bio: v })} textarea />
          </Section>

          {/* Contact */}
          <Section title="联系方式">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field icon={<MapPin className="w-3.5 h-3.5" />} label="位置" value={profile.location} editing={editing} draft={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} />
              <Field icon={<Envelope className="w-3.5 h-3.5" />} label="邮箱" value={profile.email} editing={editing} draft={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
              <Field icon={<Phone className="w-3.5 h-3.5" />} label="电话" value={profile.phone} editing={editing} draft={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
              <Field icon={<Globe className="w-3.5 h-3.5" />} label="网站" value={profile.website} editing={editing} draft={draft.website} onChange={(v) => setDraft({ ...draft, website: v })} />
              <Field icon={<GithubLogo className="w-3.5 h-3.5" />} label="GitHub" value={profile.github} editing={editing} draft={draft.github} onChange={(v) => setDraft({ ...draft, github: v })} />
              <Field icon={<LinkedinLogo className="w-3.5 h-3.5" />} label="LinkedIn" value={profile.linkedin} editing={editing} draft={draft.linkedin} onChange={(v) => setDraft({ ...draft, linkedin: v })} />
            </div>
          </Section>

          {/* Skills */}
          <Section title="技能">
            <TagEditor tags={editing ? draft.skills : profile.skills} editing={editing} onChange={(skills) => setDraft({ ...draft, skills })} />
          </Section>

          {/* Experience */}
          <Section title="工作经历">
            {(editing ? draft.experience : profile.experience).map((exp, i) => (
              <div key={i} className="border border-border-subtle rounded-lg p-4 mb-3">
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={exp.company} placeholder="公司" onChange={(e) => { const arr = [...draft.experience]; arr[i] = { ...arr[i], company: e.target.value }; setDraft({ ...draft, experience: arr }) }} className="px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent" />
                      <input value={exp.role} placeholder="职位" onChange={(e) => { const arr = [...draft.experience]; arr[i] = { ...arr[i], role: e.target.value }; setDraft({ ...draft, experience: arr }) }} className="px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent" />
                    </div>
                    <input value={exp.period} placeholder="时间 (如 2022.01 - 至今)" onChange={(e) => { const arr = [...draft.experience]; arr[i] = { ...arr[i], period: e.target.value }; setDraft({ ...draft, experience: arr }) }} className="w-full px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent" />
                    <textarea value={exp.description} placeholder="工作描述" onChange={(e) => { const arr = [...draft.experience]; arr[i] = { ...arr[i], description: e.target.value }; setDraft({ ...draft, experience: arr }) }} className="w-full px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent resize-y min-h-[60px]" />
                    <button onClick={() => { const arr = draft.experience.filter((_, j) => j !== i); setDraft({ ...draft, experience: arr }) }} className="text-xs text-danger hover:underline">删除</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[14px] font-medium text-text-primary">{exp.role}</span>
                      <span className="text-[11px] text-text-ghost">{exp.period}</span>
                    </div>
                    <span className="text-[13px] text-accent mb-2 block">{exp.company}</span>
                    {exp.description && <p className="text-[13px] text-text-tertiary whitespace-pre-wrap">{exp.description}</p>}
                  </>
                )}
              </div>
            ))}
            {editing && (
              <button onClick={() => setDraft({ ...draft, experience: [...draft.experience, { company: "", role: "", period: "", description: "" }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent border border-border-accent rounded-md hover:bg-accent-subtle transition-colors">
                <Plus className="w-3 h-3" /> 添加经历
              </button>
            )}
          </Section>

          {/* Education */}
          <Section title="教育经历">
            {(editing ? draft.education : profile.education).map((edu, i) => (
              <div key={i} className="border border-border-subtle rounded-lg p-4 mb-3">
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={edu.school} placeholder="学校" onChange={(e) => { const arr = [...draft.education]; arr[i] = { ...arr[i], school: e.target.value }; setDraft({ ...draft, education: arr }) }} className="px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent" />
                      <input value={edu.degree} placeholder="学位/专业" onChange={(e) => { const arr = [...draft.education]; arr[i] = { ...arr[i], degree: e.target.value }; setDraft({ ...draft, education: arr }) }} className="px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent" />
                    </div>
                    <input value={edu.period} placeholder="时间" onChange={(e) => { const arr = [...draft.education]; arr[i] = { ...arr[i], period: e.target.value }; setDraft({ ...draft, education: arr }) }} className="w-full px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent" />
                    <button onClick={() => { const arr = draft.education.filter((_, j) => j !== i); setDraft({ ...draft, education: arr }) }} className="text-xs text-danger hover:underline">删除</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[14px] font-medium text-text-primary">{edu.school}</span>
                      <span className="text-[11px] text-text-ghost">{edu.period}</span>
                    </div>
                    <span className="text-[13px] text-text-tertiary">{edu.degree}</span>
                  </>
                )}
              </div>
            ))}
            {editing && (
              <button onClick={() => setDraft({ ...draft, education: [...draft.education, { school: "", degree: "", period: "" }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent border border-border-accent rounded-md hover:bg-accent-subtle transition-colors">
                <Plus className="w-3 h-3" /> 添加教育
              </button>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-medium text-text-ghost uppercase tracking-[0.08em] mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Field({ icon, label, value, editing, draft, onChange, textarea }: {
  icon?: React.ReactNode; label: string; value: string; editing: boolean; draft: string;
  onChange: (v: string) => void; textarea?: boolean
}) {
  if (editing) {
    const cls = "w-full px-3 py-1.5 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent transition-colors"
    return (
      <div>
        <label className="text-[11px] text-text-ghost mb-1 block">{label}</label>
        {textarea ? (
          <textarea value={draft} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-y min-h-[80px]`} />
        ) : (
          <input value={draft} onChange={(e) => onChange(e.target.value)} className={cls} />
        )}
      </div>
    )
  }
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-text-ghost mt-0.5 shrink-0">{icon}</span>}
      <div>
        <span className="text-[11px] text-text-ghost block">{label}</span>
        <span className="text-[13px] text-text-secondary">{value}</span>
      </div>
    </div>
  )
}

function TagEditor({ tags, editing, onChange }: { tags: string[]; editing: boolean; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("")

  const add = () => {
    const t = input.trim()
    if (t && !tags.includes(t)) { onChange([...tags, t]); setInput("") }
  }

  if (!editing) {
    if (tags.length === 0) return <span className="text-[13px] text-text-ghost">暂无</span>
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="px-2 py-0.5 text-[11px] text-accent bg-accent-subtle rounded-md">#{t}</span>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-accent bg-accent-subtle rounded-md">
            #{t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="text-accent/50 hover:text-danger"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add() }} placeholder="添加技能..." className="px-3 py-1 text-[13px] bg-bg-surface border border-border-default rounded-md outline-none focus:border-border-accent w-40" />
        <button onClick={add} className="text-accent text-xs hover:underline">添加</button>
      </div>
    </div>
  )
}
