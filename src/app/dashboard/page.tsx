'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { useDashboardStore } from '../../lib/store';
import { documentApi, supabase } from '../../lib/supabase';
import DocumentCard from '../../components/dashboard/DocumentCard';
import CreateDocumentModal from '../../components/dashboard/CreateDocumentModal';
import DeleteDocumentModal from '../../components/dashboard/DeleteDocumentModal';
import ShareDocumentModal from '../../components/dashboard/ShareDocumentModal';
import EmptyState from '../../components/dashboard/EmptyState';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import { Search, Filter, Grid, List, Plus, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
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

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'owned' | 'shared'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Load user and documents
  useEffect(() => {
    if (user && !authLoading) {
      loadDocuments();
    }
  }, [user, authLoading]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentApi.getDocuments();
      // Transform Supabase documents to match store interface
      const transformedDocs = docs.map(doc => ({
        ...doc,
        collaborators: [] // Initialize empty collaborators array
      }));
      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (title: string, isPublic: boolean) => {
    try {
      // First, ensure user profile exists
      try {
        const { profileApi } = await import('../../lib/supabase');
        await profileApi.getCurrentProfile();
      } catch (profileError) {
        const { profileApi } = await import('../../lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await profileApi.createProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          });
        }
      }
      
      // First, try to get or create a default organization
      let orgId = '00000000-0000-0000-0000-000000000000';
      
      try {
        // Try to get existing organizations
        const { organizationApi } = await import('../../lib/supabase');
        const orgs = await organizationApi.getOrganizations();
        
        if (orgs.length > 0) {
          orgId = orgs[0].id; // Use the first organization
        } else {
          // Create a default organization if none exists
          const newOrg = await organizationApi.createOrganization('My Organization');
          orgId = newOrg.id;
        }
      } catch (orgError) {
        console.warn('Could not get/create organization, using default ID:', orgError);
        // Continue with default org ID
      }

      // Create the document
      const newDoc = await documentApi.createDocument(
        orgId,
        title,
        undefined, // No workspace
        { content: '' }, // Empty content
        isPublic
      );
      
      // Transform the new document to match store interface
      const transformedDoc = {
        ...newDoc,
        collaborators: []
      };
      setDocuments([transformedDoc, ...documents]);
      setShowCreateModal(false);
      router.push(`/doc/${newDoc.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      // Show error to user
      alert(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      await documentApi.deleteDocument(selectedDocument.id);
      setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
      setShowDeleteModal(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleShareDocument = async (documentId: string, userId: string, permission: 'view' | 'comment' | 'edit') => {
    try {
      // TODO: Implement document sharing using the new API
      console.log('Sharing document:', documentId, userId, permission);
      setShowShareModal(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const openDocument = (document: any) => {
    setCurrentDocument(document);
    router.push(`/doc/${document.id}`);
  };

  // Filter and search documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'owned' && doc.owner_id === user?.id) ||
      (filter === 'shared' && doc.owner_id !== user?.id);
    
    return matchesSearch && matchesFilter;
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
    return null; // Will redirect to auth
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <DashboardHeader 
        user={profile}
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

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                onChange={(e) => setFilter(e.target.value as 'all' | 'owned' | 'shared')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Documents</option>
                <option value="owned">My Documents</option>
                <option value="shared">Shared with Me</option>
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

              {/* Create Document */}
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                New Document
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
                    onEdit={() => openDocument(document)}
                    onShare={() => {
                      setSelectedDocument(document);
                      setShowShareModal(true);
                    }}
                    onDelete={() => {
                      setSelectedDocument(document);
                      setShowDeleteModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateDocumentModal
          onCreate={handleCreateDocument}
          onClose={() => setShowCreateModal(false)}
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
    </div>
  );
}
