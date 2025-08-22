'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { useDashboardStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

// Import existing modals
import CreateDocumentModal from '../../components/dashboard/CreateDocumentModal';
import EditDocumentModal from '../../components/dashboard/EditDocumentModal';
import DeleteDocumentModal from '../../components/dashboard/DeleteDocumentModal';
import ShareDocumentModal from '../../components/dashboard/ShareDocumentModal';
import BulkActionsModal from '../../components/dashboard/BulkActionsModal';

import { 
  Search, Filter, Grid, List, Plus, Loader2, 
  Edit3, Copy, Download, Archive, Trash2,
  CheckSquare, Square, MoreHorizontal,
  RefreshCw, SortAsc, SortDesc, FileText,
  Users, Calendar, Menu, Bell, Settings,
  LogOut, User, Eye, Share
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DocumentAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'duplicate' | 'share';
  status: 'pending' | 'success' | 'error';
  message?: string;
}

// ✅ WORKING DocumentCard Component - NO useEffect, NO document.addEventListener
function DocumentCard({ 
  document, 
  viewMode, 
  selected, 
  onSelect, 
  onEdit, 
  onView, 
  onDuplicate, 
  onShare, 
  onDelete,
  inlineEditing,
  inlineEditTitle,
  onInlineEditStart,
  onInlineEditSave,
  onInlineEditCancel,
  onInlineEditChange
}: any) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const canEdit = document.userRole === 'owner' || document.userRole === 'editor';
  const canDelete = document.userRole === 'owner';

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleActionClick = (action: () => void) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropdownOpen(false);
      action();
    };
  };

  // Close dropdown when clicking anywhere else
  const handleCardClick = () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
    } else {
      canEdit ? onEdit() : onView();
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow ${
          isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
        } ${selected ? 'ring-2 ring-indigo-500' : ''}`}
      >
        
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <div className="flex-shrink-0">
          <FileText className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>

        <div className="flex-1 min-w-0" onClick={handleCardClick}>
          {inlineEditing ? (
            <input
              type="text"
              value={inlineEditTitle}
              onChange={(e) => onInlineEditChange?.(e.target.value)}
              onBlur={() => onInlineEditSave?.(inlineEditTitle)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onInlineEditSave?.(inlineEditTitle);
                if (e.key === 'Escape') onInlineEditCancel?.();
              }}
              className={`text-lg font-medium bg-transparent border-b-2 border-indigo-500 focus:outline-none ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 className={`text-lg font-medium truncate cursor-pointer ${
              isDark ? 'text-white hover:text-indigo-400' : 'text-gray-900 hover:text-indigo-600'
            }`}>
              {document.title}
            </h3>
          )}
          
          <div className="flex items-center space-x-4 mt-1 text-sm">
            <span className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-4 h-4" />
              <span>{new Date(document.updated_at).toLocaleDateString()}</span>
            </span>
            
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              document.userRole === 'owner' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : document.userRole === 'editor'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {document.userRole}
            </span>

            {document.is_public && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Public
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {canEdit ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className={`p-2 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className={`p-2 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* ✅ SIMPLE DROPDOWN - No useEffect needed */}
          <div className="relative">
            <button 
              onClick={handleDropdownToggle}
              className={`p-2 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {dropdownOpen && (
              <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="py-1">
                  <button
                    onClick={handleActionClick(onDuplicate)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                      isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  
                  <button
                    onClick={handleActionClick(onShare)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                      isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
                    }`}
                  >
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  
                  {canDelete && (
                    <button
                      onClick={handleActionClick(onDelete)}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className={`relative p-6 border rounded-lg hover:shadow-md transition-shadow ${
        isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
      } ${selected ? 'ring-2 ring-indigo-500' : ''}`}
    >
      
      {onSelect && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <FileText className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        
        <div className="relative">
          <button 
            onClick={handleDropdownToggle}
            className={`p-1 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {dropdownOpen && (
            <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="py-1">
                <button
                  onClick={handleActionClick(onDuplicate)}
                  className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                    isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                
                <button
                  onClick={handleActionClick(onShare)}
                  className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                    isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
                  }`}
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                {canDelete && (
                  <button
                    onClick={handleActionClick(onDelete)}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div onClick={handleCardClick} className="cursor-pointer">
        {inlineEditing ? (
          <input
            type="text"
            value={inlineEditTitle}
            onChange={(e) => onInlineEditChange?.(e.target.value)}
            onBlur={() => onInlineEditSave?.(inlineEditTitle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onInlineEditSave?.(inlineEditTitle);
              if (e.key === 'Escape') onInlineEditCancel?.();
            }}
            className={`text-lg font-medium bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {document.title}
          </h3>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date(document.updated_at).toLocaleDateString()}
          </span>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              document.userRole === 'owner' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : document.userRole === 'editor'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {document.userRole}
            </span>

            {document.is_public && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Public
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple EmptyState component
function EmptyState({ searchQuery, onCreateDocument }: { searchQuery: string; onCreateDocument: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="text-center py-12">
      <FileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
      <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {searchQuery ? 'No documents found' : 'No documents yet'}
      </h3>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {searchQuery 
          ? `No documents match "${searchQuery}"`
          : 'Create your first document to get started'
        }
      </p>
      {!searchQuery && (
        <button
          onClick={onCreateDocument}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Create Your First Document
        </button>
      )}
    </div>
  );
}

// Simple DashboardHeader component
function DashboardHeader({ 
  user, 
  sidebarOpen, 
  onToggleSidebar 
}: { 
  user: any; 
  sidebarOpen: boolean; 
  onToggleSidebar: () => void; 
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className={`border-b transition-colors duration-300 ${
      isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg lg:hidden ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Dodoc
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className={`p-2 rounded-lg ${
            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}>
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="relative group">
            <button className={`flex items-center space-x-2 p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {user?.email?.split('@')[0] || 'User'}
              </span>
            </button>
            
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center space-x-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600`}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Simple DashboardSidebar component
function DashboardSidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
      <div className="flex flex-col h-full">
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            <a href="/dashboard" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
              isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
            }`}>
              <FileText className="w-5 h-5" />
              <span>Documents</span>
            </a>
            
            <a href="#" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
              isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}>
              <Users className="w-5 h-5" />
              <span>Shared</span>
            </a>
            
            <a href="#" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
              isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}>
              <Archive className="w-5 h-5" />
              <span>Templates</span>
            </a>
          </nav>
        </div>
      </div>
    </aside>
  );
}

// ✅ Main Dashboard Component
export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    documents,
    loading,
    sidebarOpen,
    setDocuments,
    setLoading,
    setSidebarOpen,
    setCurrentDocument
  } = useDashboardStore();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'owned' | 'shared' | 'templates'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Selection and actions
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'delete' | 'archive' | 'duplicate' | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState('');

  // Action tracking
  const [pendingActions, setPendingActions] = useState<DocumentAction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  // Load documents
  useEffect(() => {
    if (user && !authLoading) {
      loadDocuments();
    }
  }, [user, authLoading]);

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Loading documents for user:', user.email);

      // Simplified document loading without complex joins
      const { data: rawDocs, error: docError } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (docError) {
        console.error('Document query error:', docError);
        throw docError;
      }

      console.log('Raw documents loaded:', rawDocs?.length || 0);

      // Transform documents
      const transformedDocs = (rawDocs || []).map((doc) => {
        let userRole = 'none';
        
        if (doc.owner_id === user.id) {
          userRole = 'owner';
        } else if (doc.is_public) {
          userRole = 'viewer';
        }

        return {
          ...doc,
          userRole,
          collaborators: []
        };
      });

      console.log('Transformed documents:', transformedDocs.length);
      setDocuments(transformedDocs);

    } catch (error: any) {
      console.error('Error loading documents:', error);
      
      // Try to create a test document if none exist
      if (error?.code === 'PGRST116' || documents.length === 0) {
        try {
          await createTestDocument();
        } catch (createError) {
          console.error('Failed to create test document:', createError);
          toast.error('Failed to load documents. Please check your connection and try again.');
        }
      } else {
        toast.error(`Failed to load documents: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const createTestDocument = async () => {
    if (!user) return;

    try {
      console.log('Creating test document for user:', user.email);
      
      const { data: newDoc, error } = await supabase
        .from('documents')
        .insert({
          title: `Welcome Document`,
          content: { 
            type: 'doc', 
            content: [{ 
              type: 'paragraph', 
              content: [{ 
                type: 'text', 
                text: 'Welcome to your collaborative document editor!' 
              }] 
            }] 
          },
          owner_id: user.id,
          org_id: '00000000-0000-0000-0000-000000000000',
          is_public: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating test document:', error);
        throw error;
      }

      console.log('Test document created:', newDoc);
      
      const transformedDoc = {
        ...newDoc,
        userRole: 'owner',
        collaborators: []
      };

      setDocuments([transformedDoc]);
      toast.success('Welcome! Created your first document.');

    } catch (error: any) {
      console.error('Failed to create test document:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
    toast.success('Documents refreshed');
  };

  const handleCreateDocument = async (title: string, isPublic: boolean, isTemplate: boolean = false) => {
    try {
      const { data: newDoc, error } = await supabase
        .from('documents')
        .insert({
          title,
          content: { 
            type: 'doc',
            content: [{
              type: 'paragraph',
              content: [{
                type: 'text',
                text: 'Start writing your document here...'
              }]
            }]
          },
          owner_id: user?.id,
          org_id: '00000000-0000-0000-0000-000000000000',
          is_public: isPublic,
          is_template: isTemplate
        })
        .select()
        .single();

      if (error) throw error;

      const transformedDoc = {
        ...newDoc,
        userRole: 'owner',
        collaborators: []
      };

      setDocuments([transformedDoc, ...documents]);
      setShowCreateModal(false);
      toast.success('Document created successfully');
      
      if (!isTemplate) {
        router.push(`/doc/${newDoc.id}`);
      }
      
    } catch (error: any) {
      console.error('Error creating document:', error);
      toast.error(`Failed to create document: ${error.message}`);
    }
  };

  const handleUpdateDocument = async (documentId: string, updates: any) => {
    try {
      const { data: updatedDoc, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, ...updatedDoc }
          : doc
      ));

      toast.success('Document updated successfully');
      
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast.error(`Failed to update document: ${error.message}`);
    }
  };

  const handleInlineEdit = async (documentId: string, newTitle: string) => {
    if (newTitle.trim() === '') {
      toast.error('Document title cannot be empty');
      return;
    }

    await handleUpdateDocument(documentId, { title: newTitle.trim() });
    setInlineEditingId(null);
    setInlineEditTitle('');
  };

  const handleDuplicateDocument = async (document: any) => {
    try {
      const { data: duplicatedDoc, error } = await supabase
        .from('documents')
        .insert({
          title: `${document.title} (Copy)`,
          content: document.content,
          owner_id: user?.id,
          org_id: document.org_id || '00000000-0000-0000-0000-000000000000',
          workspace_id: document.workspace_id,
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      const transformedDoc = {
        ...duplicatedDoc,
        userRole: 'owner',
        collaborators: []
      };

      setDocuments([transformedDoc, ...documents]);
      toast.success('Document duplicated successfully');
      
    } catch (error: any) {
      console.error('Error duplicating document:', error);
      toast.error(`Failed to duplicate document: ${error.message}`);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', selectedDocument.id);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
      setShowDeleteModal(false);
      setSelectedDocument(null);
      toast.success('Document deleted successfully');
      
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'duplicate', documentIds: string[]) => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('documents')
          .delete()
          .in('id', documentIds);

        if (error) throw error;

        setDocuments(prev => prev.filter(doc => !documentIds.includes(doc.id)));
        toast.success(`${documentIds.length} documents deleted`);
        
      } else if (action === 'duplicate') {
        const documentsToClone = documents.filter(doc => documentIds.includes(doc.id));
        
        const clonePromises = documentsToClone.map(doc => 
          supabase
            .from('documents')
            .insert({
              title: `${doc.title} (Copy)`,
              content: doc.content,
              owner_id: user?.id,
              org_id: doc.org_id || '00000000-0000-0000-0000-000000000000',
              workspace_id: doc.workspace_id,
              is_public: false
            })
            .select()
            .single()
        );
        
        const results = await Promise.all(clonePromises);
        const clonedDocs = results
          .filter(result => !result.error)
          .map(result => result.data);
        
        const transformedClones = clonedDocs.map(doc => ({
          ...doc,
          userRole: 'owner',
          collaborators: []
        }));
        
        setDocuments(prev => [...transformedClones, ...prev]);
        toast.success(`${documentIds.length} documents duplicated`);
      }

      setSelectedDocuments([]);
      setShowBulkModal(false);
      
    } catch (error: any) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} documents: ${error.message}`);
    }
  };

  const handleShareDocument = async (documentId: string, emails: string[], role: 'viewer' | 'editor') => {
    try {
      toast.success(`Document would be shared with ${emails.length} user(s) as ${role}(s)`);
      setShowShareModal(false);
      setSelectedDocument(null);
    } catch (error: any) {
      console.error('Error sharing document:', error);
      toast.error(`Failed to share document: ${error.message}`);
    }
  };

  const openDocument = (document: any) => {
    setCurrentDocument(document);
    router.push(`/doc/${document.id}`);
  };

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  // Filter, search, and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || 
        (filter === 'owned' && doc.userRole === 'owner') ||
        (filter === 'shared' && doc.userRole !== 'owner' && doc.userRole !== 'none') ||
        (filter === 'templates' && doc.is_template);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated':
        default:
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className={isDark ? 'text-white' : 'text-gray-900'}>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <DashboardHeader 
        user={user}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        <DashboardSidebar sidebarOpen={sidebarOpen} />

        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    My Documents
                  </h1>
                  <p className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Create, manage, and collaborate on your documents
                  </p>
                </div>
                
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedDocuments.length > 0 && (
              <div className={`mb-6 p-4 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    isDark ? 'text-white' : 'text-blue-900'
                  }`}>
                    {selectedDocuments.length} document(s) selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkAction('duplicate', selectedDocuments)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={() => {
                        setBulkAction('delete');
                        setShowBulkModal(true);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => setSelectedDocuments([])}
                      className={`px-3 py-1.5 rounded border ${
                        isDark
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Documents</option>
                <option value="owned">My Documents</option>
                <option value="shared">Shared with Me</option>
                <option value="templates">Templates</option>
              </select>

              {/* View Mode */}
              <div className={`flex rounded-lg border ${
                isDark ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid'
                      ? isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-r-lg transition-colors ${
                    viewMode === 'list'
                      ? isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Select All */}
              {filteredDocuments.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {selectedDocuments.length === filteredDocuments.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>Select All</span>
                </button>
              )}

              {/* Create Document */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>New Document</span>
              </button>
            </div>

            {/* Documents */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>Loading documents...</span>
                </div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <EmptyState 
                searchQuery={searchQuery}
                onCreateDocument={() => setShowCreateModal(true)}
              />
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    viewMode={viewMode}
                    selected={selectedDocuments.includes(document.id)}
                    onSelect={() => handleSelectDocument(document.id)}
                    onEdit={() => openDocument(document)}
                    onView={() => openDocument(document)}
                    onDuplicate={() => handleDuplicateDocument(document)}
                    onShare={() => {
                      setSelectedDocument(document);
                      setShowShareModal(true);
                    }}
                    onDelete={() => {
                      setSelectedDocument(document);
                      setShowDeleteModal(true);
                    }}
                    inlineEditing={inlineEditingId === document.id}
                    inlineEditTitle={inlineEditTitle}
                    onInlineEditStart={() => {
                      setInlineEditingId(document.id);
                      setInlineEditTitle(document.title);
                    }}
                    onInlineEditSave={(newTitle) => handleInlineEdit(document.id, newTitle)}
                    onInlineEditCancel={() => {
                      setInlineEditingId(null);
                      setInlineEditTitle('');
                    }}
                    onInlineEditChange={setInlineEditTitle}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateDocumentModal
          onCreate={handleCreateDocument}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedDocument && (
        <EditDocumentModal
          document={selectedDocument}
          onUpdate={(updates) => handleUpdateDocument(selectedDocument.id, updates)}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {showDeleteModal && selectedDocument && (
        <DeleteDocumentModal
          document={selectedDocument}
          onDelete={handleDeleteDocument}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {showShareModal && selectedDocument && (
        <ShareDocumentModal
          document={selectedDocument}
          onShare={handleShareDocument}
          onClose={() => {
            setShowShareModal(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {showBulkModal && (
        <BulkActionsModal
          action={bulkAction}
          documentCount={selectedDocuments.length}
          onConfirm={() => {
            if (bulkAction) {
              handleBulkAction(bulkAction, selectedDocuments);
            }
          }}
          onClose={() => {
            setShowBulkModal(false);
            setBulkAction(null);
          }}
        />
      )}
    </div>
  );
}
