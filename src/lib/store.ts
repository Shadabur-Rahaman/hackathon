import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, Document as SupabaseDocument } from './supabase';

// Update User interface to match Profile
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  color: string;
}

// Update Document interface to match Supabase Document
export interface Document extends SupabaseDocument {
  collaborators: Collaborator[];
}

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
}

export interface DashboardState {
  // User state
  user: User | null;
  
  // Documents state
  documents: Document[];
  currentDocument: Document | null;
  
  // Collaboration state
  collaborators: Collaborator[];
  
  // UI state
  loading: boolean;
  sidebarOpen: boolean;
  panels: {
    comments: boolean;
    share: boolean;
    versions: boolean;
  };
  
  // Panel states (for backward compatibility)
  commentsPanelOpen: boolean;
  sharePanelOpen: boolean;
  versionsPanelOpen: boolean;
  
  // Connection state (for backward compatibility)
  isConnected: boolean;
  isSaving: boolean;
  
  // Connection state
  connectionStatus: 'online' | 'offline' | 'syncing';
  lastSaved: Date | null;
  saving: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setCurrentDocument: (document: Document | null) => void;
  
  // Collaboration actions
  setCollaborators: (collaborators: Collaborator[]) => void;
  addCollaborator: (collaborator: Collaborator) => void;
  removeCollaborator: (id: string) => void;
  updateCollaboratorCursor: (id: string, cursor: { x: number; y: number }) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  togglePanel: (panel: keyof DashboardState['panels']) => void;
  
  // Panel actions (for backward compatibility)
  setCommentsPanelOpen: (open: boolean) => void;
  setSharePanelOpen: (open: boolean) => void;
  setVersionsPanelOpen: (open: boolean) => void;
  
  // Connection actions (for backward compatibility)
  setIsConnected: (connected: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  
  // Connection actions
  setConnectionStatus: (status: DashboardState['connectionStatus']) => void;
  setLastSaved: (date: Date) => void;
  setSaving: (saving: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      documents: [],
      currentDocument: null,
      collaborators: [],
      loading: false,
      sidebarOpen: false,
      panels: {
        comments: false,
        share: false,
        versions: false,
      },
      commentsPanelOpen: false,
      sharePanelOpen: false,
      versionsPanelOpen: false,
      connectionStatus: 'offline',
      isConnected: false,
      lastSaved: null,
      saving: false,
      isSaving: false,

      // User actions
      setUser: (user) => set({ user }),

      // Document actions
      setDocuments: (documents) => set({ documents }),
      addDocument: (document) => set((state) => ({ 
        documents: [document, ...state.documents] 
      })),
      updateDocument: (id, updates) => set((state) => ({
        documents: state.documents.map(doc => 
          doc.id === id ? { ...doc, ...updates } : doc
        ),
        currentDocument: state.currentDocument?.id === id 
          ? { ...state.currentDocument, ...updates }
          : state.currentDocument
      })),
      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id),
        currentDocument: state.currentDocument?.id === id 
          ? null 
          : state.currentDocument
      })),
      setCurrentDocument: (document) => set({ currentDocument: document }),

      // Collaboration actions
      setCollaborators: (collaborators) => set({ collaborators }),
      addCollaborator: (collaborator) => set((state) => ({
        collaborators: [...state.collaborators.filter(c => c.id !== collaborator.id), collaborator]
      })),
      removeCollaborator: (id) => set((state) => ({
        collaborators: state.collaborators.filter(c => c.id !== id)
      })),
      updateCollaboratorCursor: (id, cursor) => set((state) => ({
        collaborators: state.collaborators.map(c => 
          c.id === id ? { ...c, cursor } : c
        )
      })),

      // UI actions
      setLoading: (loading) => set({ loading }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      togglePanel: (panel) => set((state) => ({
        panels: { ...state.panels, [panel]: !state.panels[panel] }
      })),

      // Connection actions
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setLastSaved: (lastSaved) => set({ lastSaved }),
      setSaving: (saving) => set({ saving }),
      
      // Panel actions (for backward compatibility)
      setCommentsPanelOpen: (commentsPanelOpen) => set({ commentsPanelOpen }),
      setSharePanelOpen: (sharePanelOpen) => set({ sharePanelOpen }),
      setVersionsPanelOpen: (versionsPanelOpen) => set({ versionsPanelOpen }),
      
      // Connection actions (for backward compatibility)
      setIsConnected: (isConnected) => set({ isConnected }),
      setIsSaving: (isSaving) => set({ isSaving }),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        user: state.user,
        documents: state.documents,
        currentDocument: state.currentDocument,
        sidebarOpen: state.sidebarOpen,
        panels: state.panels,
      }),
    }
  )
);
