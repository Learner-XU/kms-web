import { create } from "zustand";
import { Note, notesAPI, searchAPI, graphAPI, authAPI, SearchResult, GraphData, AuthUser, setToken, clearToken, getToken } from "./api";


interface KMSStore {
  // Auth
  user: AuthUser | null;
  authLoading: boolean;

  // Notes
  notes: Note[];
  currentNote: Note | null;
  notesLoading: boolean;

  // Error
  error: string | null;

  // File tree

  // Search
  searchResults: SearchResult[];
  searchQuery: string;
  searchLoading: boolean;

  // Graph
  graphData: GraphData | null;

  // Active view
  activeView: "notes" | "diary" | "graph" | "tasks" | "ai";
  activeSpace: string;

  // Dialog
  showNewNoteDialog: boolean;

  // Right sidebar
  showRightSidebar: boolean;
  showHistory: boolean;

  // Actions
  loadNotes: (dir?: string) => Promise<void>;
  loadNote: (path: string) => Promise<void>;
  createNote: (title: string, path: string, type?: string) => Promise<void>;
  updateNote: (path: string, content: string) => Promise<void>;
  deleteNote: (path: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  loadGraph: () => Promise<void>;
  setActiveView: (view: KMSStore["activeView"]) => void;
  setActiveSpace: (space: string) => void;
  setCurrentNote: (note: Note | null) => void;
  clearSearch: () => void;
  clearError: () => void;
  setShowNewNoteDialog: (show: boolean) => void;
  setShowRightSidebar: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  toggleRightSidebar: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

let loadNoteSeq = 0

export const useKMSStore = create<KMSStore>((set, get) => ({
  notes: [],
  currentNote: null,
  notesLoading: false,
  error: null,
  searchResults: [],
  searchQuery: "",
  searchLoading: false,
  graphData: null,
  activeView: "notes",
  activeSpace: "",
  user: null,
  authLoading: true,
  showNewNoteDialog: false,
  showRightSidebar: false,
  showHistory: false,

  loadNotes: async (dir) => {
    set({ notesLoading: true });
    try {
      const { notes } = await notesAPI.list(dir);
      set({ notes, notesLoading: false });
    } catch (e) {
      console.error("[loadNotes]", e)
      set({ notesLoading: false, error: 'Failed to load notes' });
    }
  },

  loadNote: async (path) => {
    try {
      const reqId = ++loadNoteSeq
      const note = await notesAPI.get(path)
      if (reqId !== loadNoteSeq) return // stale
      set({ currentNote: note });
    } catch (e) {
      console.error("[loadNote]", e)
      set({ error: 'Failed to load note' });
    }
  },

  createNote: async (title, path, type?) => {
    try {
      const note = await notesAPI.create({ title, path, type });
      set((s) => ({ notes: [...s.notes, note], currentNote: note }));
    } catch (e) {
      console.error("[createNote]", e)
      set({ error: 'Failed to create note' });
      throw e;
    }
  },

  updateNote: async (path, content) => {
    try {
      const note = await notesAPI.update(path, { content });
      set((s) => ({
        notes: s.notes.map((n) => (n.path === path ? note : n)),
        currentNote: note,
      }));
    } catch (e) {
      console.error("[updateNote]", e)
      set({ error: 'Failed to update note' });
      throw e;
    }
  },

  deleteNote: async (path) => {
    try {
      await notesAPI.delete(path);
      set((s) => ({
        notes: s.notes.filter((n) => n.path !== path),
        currentNote: s.currentNote?.path === path ? null : s.currentNote,
      }));
    } catch (e) {
      console.error("[deleteNote]", e)
      set({ error: 'Failed to delete note' });
    }
  },

  search: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], searchQuery: "" });
      return;
    }
    set({ searchLoading: true, searchQuery: query });
    try {
      const { results } = await searchAPI.search(query);
      set({ searchResults: results || [], searchLoading: false });
    } catch (e) {
      console.error("[search]", e)
      set({ searchLoading: false, error: 'Search failed' });
    }
  },

  loadGraph: async () => {
    try {
      const data = await graphAPI.get();
      set({ graphData: data });
    } catch (e) {
      console.error("[loadGraph]", e)
      set({ error: 'Failed to load graph' });
    }
  },

  setActiveView: (view) => set({ activeView: view }),
  setActiveSpace: (space) => set({ activeSpace: space }),
  setCurrentNote: (note) => set({ currentNote: note }),
  clearSearch: () => set({ searchResults: [], searchQuery: "" }),
  clearError: () => set({ error: null }),
  setShowNewNoteDialog: (show) => set({ showNewNoteDialog: show }),
  setShowRightSidebar: (show) => set({ showRightSidebar: show }),
  setShowHistory: (show) => set({ showHistory: show }),
  toggleRightSidebar: () => set((s) => ({ showRightSidebar: !s.showRightSidebar })),
  login: async (username, password) => {
    try {
      const res = await authAPI.login(username, password);
      setToken(res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      set({ user: res.user });
    } catch (e) {
      console.error("[login]", e)
      set({ error: 'Login failed' });
      throw e;
    }
  },
  register: async (username, email, password, nickname) => {
    try {
      const res = await authAPI.register(username, email, password, nickname);
      setToken(res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      set({ user: res.user });
    } catch (e) {
      console.error("[register]", e)
      set({ error: 'Registration failed' });
      throw e;
    }
  },
  logout: () => {
    clearToken();
    set({ user: null, notes: [], currentNote: null });
  },
  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ authLoading: false });
      return;
    }
    try {
      const user = await authAPI.me();
      set({ user, authLoading: false });
    } catch (e) {
      console.warn("[checkAuth] token invalid:", e)
      clearToken();
      set({ user: null, authLoading: false });
    }
  },
}));
