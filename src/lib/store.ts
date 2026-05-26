import { create } from "zustand";
import { Note, notesAPI, searchAPI, graphAPI, SearchResult, GraphData } from "./api";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

interface KMSStore {
  // Notes
  notes: Note[];
  currentNote: Note | null;
  notesLoading: boolean;

  // File tree
  fileTree: TreeNode[];

  // Search
  searchResults: SearchResult[];
  searchQuery: string;
  searchLoading: boolean;

  // Graph
  graphData: GraphData | null;

  // Active view
  activeView: "notes" | "diary" | "graph" | "tasks" | "ai";
  activeSpace: string;

  // Actions
  loadNotes: (dir?: string) => Promise<void>;
  loadNote: (path: string) => Promise<void>;
  createNote: (title: string, path: string) => Promise<void>;
  updateNote: (path: string, content: string) => Promise<void>;
  deleteNote: (path: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  loadGraph: () => Promise<void>;
  setActiveView: (view: KMSStore["activeView"]) => void;
  setActiveSpace: (space: string) => void;
  setCurrentNote: (note: Note | null) => void;
  clearSearch: () => void;
}

export const useKMSStore = create<KMSStore>((set, get) => ({
  notes: [],
  currentNote: null,
  notesLoading: false,
  fileTree: [],
  searchResults: [],
  searchQuery: "",
  searchLoading: false,
  graphData: null,
  activeView: "notes",
  activeSpace: "",

  loadNotes: async (dir) => {
    set({ notesLoading: true });
    try {
      const { notes } = await notesAPI.list(dir);
      set({ notes, notesLoading: false });
      // Build file tree from notes
      const tree = buildFileTree(notes);
      set({ fileTree: tree });
    } catch {
      set({ notesLoading: false });
    }
  },

  loadNote: async (path) => {
    try {
      const note = await notesAPI.get(path);
      set({ currentNote: note });
    } catch (e) {
      console.error("load note failed:", e);
    }
  },

  createNote: async (title, path) => {
    try {
      const note = await notesAPI.create({ title, path });
      set((s) => ({ notes: [...s.notes, note], currentNote: note }));
    } catch (e) {
      console.error("create note failed:", e);
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
      console.error("update note failed:", e);
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
      console.error("delete note failed:", e);
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
    } catch {
      set({ searchLoading: false });
    }
  },

  loadGraph: async () => {
    try {
      const data = await graphAPI.get();
      set({ graphData: data });
    } catch (e) {
      console.error("load graph failed:", e);
    }
  },

  setActiveView: (view) => set({ activeView: view }),
  setActiveSpace: (space) => set({ activeSpace: space }),
  setCurrentNote: (note) => set({ currentNote: note }),
  clearSearch: () => set({ searchResults: [], searchQuery: "" }),
}));

function buildFileTree(notes: Note[]): TreeNode[] {
  const root: TreeNode[] = [];
  const dirMap = new Map<string, TreeNode>();

  for (const note of notes) {
    const parts = note.path.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (i === parts.length - 1) {
        // File node
        const fileNode: TreeNode = { name: note.title, path: note.path, type: "file" };
        if (parentPath && dirMap.has(parentPath)) {
          dirMap.get(parentPath)!.children = dirMap.get(parentPath)!.children || [];
          dirMap.get(parentPath)!.children!.push(fileNode);
        } else {
          root.push(fileNode);
        }
      } else {
        // Dir node
        if (!dirMap.has(currentPath)) {
          const dirNode: TreeNode = { name: part, path: currentPath, type: "folder", children: [] };
          dirMap.set(currentPath, dirNode);
          if (parentPath && dirMap.has(parentPath)) {
            dirMap.get(parentPath)!.children!.push(dirNode);
          } else {
            root.push(dirNode);
          }
        }
      }
    }
  }

  return root;
}
