const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Note {
  id: string;
  title: string;
  path: string;
  content: string;
  tags: string[];
  type: string;
  status: string;
  source?: string;
  links: string[];
  backlinks: string[];
  summary?: string;
  created: string;
  updated: string;
  sha: string;
}

export interface CreateNoteRequest {
  title: string;
  path: string;
  content?: string;
  tags?: string[];
  type?: string;
  status?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  type?: string;
  status?: string;
  source?: string;
  summary?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  path: string;
  type: string;
  status: string;
  tags: string[];
  summary: string;
  snippet: string;
  score: number;
}

export interface GraphNode {
  id: string;
  title: string;
  type: string;
  status: string;
  tags: string[];
  link_count: number;
  updated: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  context?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

// Notes
export const notesAPI = {
  list: (dir?: string) =>
    fetchAPI<{ notes: Note[] }>(`/api/notes${dir ? `?dir=${dir}` : ""}`),

  get: (path: string) =>
    fetchAPI<Note>(`/api/notes/${path}`),

  create: (data: CreateNoteRequest) =>
    fetchAPI<Note>("/api/notes", { method: "POST", body: JSON.stringify(data) }),

  update: (path: string, data: UpdateNoteRequest) =>
    fetchAPI<Note>(`/api/notes/${path}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (path: string) =>
    fetchAPI<{ status: string }>(`/api/notes/${path}`, { method: "DELETE" }),

  history: (path: string) =>
    fetchAPI<{ commits: { sha: string; message: string; created: string; author: { name: string } }[] }>(
      `/api/notes/${path}/history`
    ),
};

// Search
export const searchAPI = {
  search: (query: string, filters?: { type?: string; status?: string; tags?: string }) => {
    const params = new URLSearchParams({ q: query });
    if (filters?.type) params.set("type", filters.type);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.tags) params.set("tags", filters.tags);
    return fetchAPI<{ results: SearchResult[]; total: number; query: string }>(`/api/search?${params}`);
  },

  backlinks: (noteId: string) =>
    fetchAPI<{ backlinks: SearchResult[] }>(`/api/notes/${noteId}/backlinks`),
};

// Graph
export const graphAPI = {
  get: () => fetchAPI<GraphData>("/api/graph"),

  orphans: () => fetchAPI<{ orphans: GraphNode[] }>("/api/graph/orphans"),
};
