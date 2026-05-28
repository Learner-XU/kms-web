// 使用相对路径，通过 Next.js rewrite 代理到后端
const API_BASE = "";

// Token management
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function setToken(token: string) {
  localStorage.setItem("access_token", token);
}

function clearToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export { getToken, setToken, clearToken };

function sanitizePath(path: string): string {
  if (path.includes('..')) {
    throw new Error('Invalid path: contains ..');
  }
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

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

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setToken(data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    return true;
  } catch {
    return false;
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers as Record<string, string>,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    if (res.status === 401) {
      // Attempt token refresh before giving up
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry original request with new token
        const newToken = getToken();
        if (newToken) headers["Authorization"] = `Bearer ${newToken}`;
        const retryRes = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        if (retryRes.ok) return retryRes.json();
        // Read error details from the retry response, not the original 401
        const retryErr = await retryRes.json().catch(() => ({ error: retryRes.statusText }));
        throw new Error(retryErr.error || `API error: ${retryRes.status}`);
      }
      clearToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

// Notes
export const notesAPI = {
  list: (dir?: string) =>
    fetchAPI<{ notes: Note[] }>(`/api/notes${dir ? `?dir=${encodeURIComponent(dir)}` : ""}`),

  get: (path: string) =>
    fetchAPI<Note>(`/api/notes/${sanitizePath(path)}`),

  create: (data: CreateNoteRequest) =>
    fetchAPI<Note>("/api/notes", { method: "POST", body: JSON.stringify(data) }),

  update: (path: string, data: UpdateNoteRequest) =>
    fetchAPI<Note>(`/api/notes/${sanitizePath(path)}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (path: string) =>
    fetchAPI<{ status: string }>(`/api/notes/${sanitizePath(path)}`, { method: "DELETE" }),

  history: (path: string) =>
    fetchAPI<{ commits: { sha: string; message: string; created: string; author: { name: string } }[] }>(
      `/api/history/${sanitizePath(path)}`
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
    fetchAPI<{ backlinks: SearchResult[] }>(`/api/backlinks/${encodeURIComponent(noteId)}`),
};

// Graph
export const graphAPI = {
  get: () => fetchAPI<GraphData>("/api/graph"),

  orphans: () => fetchAPI<{ orphans: GraphNode[] }>("/api/graph/orphans"),
};

// Auth
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  nickname: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

export const authAPI = {
  login: (username: string, password: string) =>
    fetchAPI<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, email: string, password: string, nickname?: string) =>
    fetchAPI<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, nickname }),
    }),

  me: () => fetchAPI<AuthUser>("/api/auth/me"),

  refresh: (refreshToken: string) =>
    fetchAPI<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};
