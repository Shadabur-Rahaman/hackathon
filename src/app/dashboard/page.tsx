// src/app/dashboard/page.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Document {
  id: string
  title: string
  content: string
  owner: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  isOwner: boolean
  sharedWith: Collaborator[]
  lastModified: string
  createdAt: string
  status: 'private' | 'shared' | 'public'
  permissions: {
    canEdit: boolean
    canShare: boolean
    canDelete: boolean
  }
  isOnline?: boolean
  version: number
}

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'online' | 'offline' | 'pending'
  avatar?: string
  lastSeen?: string
  permissions: {
    canEdit: boolean
    canComment: boolean
    canShare: boolean
  }
}

interface ActivityItem {
  id: string
  type: 'created' | 'edited' | 'shared' | 'commented' | 'opened' | 'deleted'
  documentId: string
  documentTitle: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  details?: string
}

// Enhanced mock data with real functionality
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Project Proposal 2025',
    content: '# Project Proposal\n\nThis is the main project proposal...',
    owner: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    isOwner: true,
    sharedWith: [
      {
        id: 'user2',
        name: 'Alice Smith',
        email: 'alice@example.com',
        role: 'editor',
        status: 'online',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7e5e11e?w=40&h=40&fit=crop&crop=face',
        permissions: { canEdit: true, canComment: true, canShare: false }
      }
    ],
    lastModified: '2025-08-21T10:30:00Z',
    createdAt: '2025-08-20T08:00:00Z',
    status: 'shared',
    permissions: { canEdit: true, canShare: true, canDelete: true },
    isOnline: true,
    version: 5
  },
  {
    id: '2',
    title: 'Meeting Notes - Q4 Planning',
    content: '## Q4 Meeting Notes\n\nAttendees: Alice, Bob, Charlie...',
    owner: {
      id: 'user2',
      name: 'Alice Smith',
      email: 'alice@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7e5e11e?w=40&h=40&fit=crop&crop=face'
    },
    isOwner: false,
    sharedWith: [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'editor',
        status: 'online',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        permissions: { canEdit: true, canComment: true, canShare: false }
      }
    ],
    lastModified: '2025-08-20T15:45:00Z',
    createdAt: '2025-08-19T14:00:00Z',
    status: 'shared',
    permissions: { canEdit: true, canShare: false, canDelete: false },
    isOnline: false,
    version: 3
  }
]

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'edited',
    documentId: '1',
    documentTitle: 'Project Proposal 2025',
    user: { id: 'user1', name: 'You', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
    timestamp: '2025-08-21T11:30:00Z',
    details: 'Updated project timeline'
  }
]

export default function AdvancedDashboardPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities)
  const [filter, setFilter] = useState<'all' | 'owned' | 'shared'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  
  // Modal states
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  
  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({})
  
  // Real-time updates simulation
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Simulate real-time updates
    intervalRef.current = setInterval(() => {
      setDocuments(prev => prev.map(doc => ({
        ...doc,
        isOnline: Math.random() > 0.3 // Simulate online status changes
      })))
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'owned' && doc.isOwner) || 
                         (filter === 'shared' && !doc.isOwner)
    
    const matchesSearch = searchQuery === '' || 
                         doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const setActionLoadingState = (docId: string, action: string, loading: boolean) => {
    setActionLoading(prev => ({
      ...prev,
      [`${docId}-${action}`]: loading
    }))
  }

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString()
    }
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Keep last 10 activities
  }, [])

  const handleCreateDocument = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        title: `Untitled Document ${documents.length + 1}`,
        content: '',
        owner: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        },
        isOwner: true,
        sharedWith: [],
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'private',
        permissions: { canEdit: true, canShare: true, canDelete: true },
        isOnline: true,
        version: 1
      }
      
      setDocuments(prev => [newDoc, ...prev])
      addActivity({
        type: 'created',
        documentId: newDoc.id,
        documentTitle: newDoc.title,
        user: { id: 'user1', name: 'You' }
      })

      // Auto-open for editing
      setTimeout(() => {
        setEditingId(newDoc.id)
        setEditTitle(newDoc.title)
      }, 500)
      
    } catch (error) {
      console.error('Failed to create document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDocument = async (doc: Document) => {
    setActionLoadingState(doc.id, 'open', true)
    
    try {
      // Simulate loading document content
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addActivity({
        type: 'opened',
        documentId: doc.id,
        documentTitle: doc.title,
        user: { id: 'user1', name: 'You' }
      })

      // Navigate to document editor
      router.push(`/document/${doc.id}`)
      
    } catch (error) {
      console.error('Failed to open document:', error)
    } finally {
      setActionLoadingState(doc.id, 'open', false)
    }
  }

  const handleRenameStart = (doc: Document) => {
    setSelectedDocument(doc)
    setEditTitle(doc.title)
    setRenameModalOpen(true)
  }

  const handleRenameSubmit = async () => {
    if (!selectedDocument || !editTitle.trim()) return
    
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === selectedDocument.id 
            ? { 
                ...doc, 
                title: editTitle.trim(), 
                lastModified: new Date().toISOString(),
                version: doc.version + 1
              }
            : doc
        )
      )
      
      addActivity({
        type: 'edited',
        documentId: selectedDocument.id,
        documentTitle: editTitle.trim(),
        user: { id: 'user1', name: 'You' },
        details: 'Renamed document'
      })
      
      setRenameModalOpen(false)
      setSelectedDocument(null)
      setEditTitle('')
      
    } catch (error) {
      console.error('Failed to rename document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (doc: Document) => {
    setSelectedDocument(doc)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedDocument) return
    
    setActionLoadingState(selectedDocument.id, 'delete', true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setDocuments(prev => prev.filter(d => d.id !== selectedDocument.id))
      addActivity({
        type: 'deleted',
        documentId: selectedDocument.id,
        documentTitle: selectedDocument.title,
        user: { id: 'user1', name: 'You' }
      })
      
      setDeleteModalOpen(false)
      setSelectedDocument(null)
      
    } catch (error) {
      console.error('Failed to delete document:', error)
    } finally {
      setActionLoadingState(selectedDocument.id, 'delete', false)
    }
  }

  const handleShareDocument = (doc: Document) => {
    setSelectedDocument(doc)
    setShareModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClass = "w-4 h-4"
    switch (type) {
      case 'created':
        return <svg className={`${iconClass} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      case 'edited':
        return <svg className={`${iconClass} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      case 'shared':
        return <svg className={`${iconClass} text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
      case 'opened':
        return <svg className={`${iconClass} text-indigo-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      case 'deleted':
        return <svg className={`${iconClass} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CollaboDoc
          </Link>

          {/* Enhanced Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents, people..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="Profile"
                className="w-8 h-8 rounded-full ring-2 ring-indigo-100"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">John Doe</span>
            </div>
            <Link 
              href="/auth/login" 
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Logout
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} • {documents.filter(d => d.isOnline).length} online
            </p>
          </div>
          <button 
            onClick={handleCreateDocument}
            disabled={isLoading}
            className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            {isLoading ? 'Creating...' : 'New Document'}
          </button>
        </div>

        {/* Enhanced Stats with Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{documents.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Owned by You</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {documents.filter(d => d.isOwner).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shared with You</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {documents.filter(d => !d.isOwner).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Now</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {documents.filter(d => d.isOnline).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-4 sm:mb-0 w-fit">
            {[
              { key: 'all', label: 'All Documents', count: documents.length },
              { key: 'owned', label: 'Owned by Me', count: documents.filter(d => d.isOwner).length },
              { key: 'shared', label: 'Shared with Me', count: documents.filter(d => !d.isOwner).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center space-x-2 ${
                  filter === tab.key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  filter === tab.key
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedDocuments.size > 0 && (
            <div className="flex items-center space-x-2 animate-fadeIn">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDocuments.size} selected
              </span>
              <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                Delete Selected
              </button>
              <button 
                onClick={() => setSelectedDocuments(new Set())}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Enhanced Documents Grid */}
          <div className="xl:col-span-3">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mb-6">
                  {searchQuery ? (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {searchQuery ? 'No documents found' : 'No documents yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm">
                  {searchQuery 
                    ? `No documents match "${searchQuery}". Try adjusting your search.`
                    : 'Create your first document to start collaborating with your team.'
                  }
                </p>
                {!searchQuery && (
                  <button 
                    onClick={handleCreateDocument}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Document
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className={`group bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-6 relative ${
                      selectedDocuments.has(document.id) ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    {/* Document Selection Checkbox */}
                    <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(document.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedDocuments)
                          if (e.target.checked) {
                            newSelected.add(document.id)
                          } else {
                            newSelected.delete(document.id)
                          }
                          setSelectedDocuments(newSelected)
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </div>

                    {/* Online Indicator */}
                    {document.isOnline && (
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Document is being viewed"></div>
                      </div>
                    )}

                    {/* Document Header */}
                    <div className="flex justify-between items-start mb-4 mt-2">
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          onClick={() => handleOpenDocument(document)}
                        >
                          {document.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            document.status === 'private' 
                              ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              : document.status === 'shared'
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {document.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            v{document.version}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {document.permissions.canEdit && (
                          <button
                            onClick={() => handleRenameStart(document)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Rename document"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        
                        {document.permissions.canShare && (
                          <button
                            onClick={() => handleShareDocument(document)}
                            className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title="Share document"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>
                        )}
                        
                        {document.permissions.canDelete && (
                          <button
                            onClick={() => handleDeleteDocument(document)}
                            disabled={actionLoading[`${document.id}-delete`]}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            title="Delete document"
                          >
                            {actionLoading[`${document.id}-delete`] ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Document Details */}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <img
                          src={document.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(document.owner.name)}&background=6366f1&color=fff`}
                          alt={document.owner.name}
                          className="w-4 h-4 rounded-full mr-2"
                        />
                        <span>{document.isOwner ? 'Owned by you' : `Owned by ${document.owner.name}`}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Modified {formatDate(document.lastModified)}</span>
                      </div>

                      {document.sharedWith.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div className="flex -space-x-1 mr-2">
                            {document.sharedWith.slice(0, 3).map((collaborator, index) => (
                              <img
                                key={collaborator.id}
                                src={collaborator.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(collaborator.name)}&background=random`}
                                alt={collaborator.name}
                                className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-900"
                                title={collaborator.name}
                              />
                            ))}
                          </div>
                          <span className="truncate">
                            {document.sharedWith.length === 1 
                              ? document.sharedWith[0].name
                              : `${document.sharedWith.length} collaborators`
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Document Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            document.isOwner 
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {document.isOwner ? 'Owner' : document.sharedWith.find(c => c.id === 'user1')?.role || 'Viewer'}
                          </span>
                          
                          {document.isOnline && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                              Live
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleOpenDocument(document)}
                          disabled={actionLoading[`${document.id}-open`]}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center disabled:opacity-50"
                        >
                          {actionLoading[`${document.id}-open`] ? (
                            <>
                              <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                              </svg>
                              Opening...
                            </>
                          ) : (
                            <>
                              Open
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Enhanced Activity Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
              <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Recent Activity
                </h3>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            <span className="font-medium">{activity.user.name}</span>
                            {' '}
                            <span className="text-gray-600 dark:text-gray-400">
                              {activity.type === 'created' && 'created'}
                              {activity.type === 'edited' && 'edited'}
                              {activity.type === 'shared' && 'shared'}
                              {activity.type === 'opened' && 'opened'}
                              {activity.type === 'deleted' && 'deleted'}
                            </span>
                            {' '}
                            <span className="font-medium">{activity.documentTitle}</span>
                          </p>
                          {activity.details && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {activity.details}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDateTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modals */}
      
      {/* Rename Modal */}
      {renameModalOpen && selectedDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={() => setRenameModalOpen(false)} />
            
            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Rename Document
                </h3>
              </div>
              
              <div className="px-6 py-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Name
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) handleRenameSubmit()
                      if (e.key === 'Escape') setRenameModalOpen(false)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Enter document name"
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setRenameModalOpen(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenameSubmit}
                    disabled={!editTitle.trim() || isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                      </svg>
                    ) : (
                      'Rename'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={() => setDeleteModalOpen(false)} />
            
            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Delete Document
                  </h3>
                </div>
              </div>
              
              <div className="px-6 py-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-gray-100">"{selectedDocument.title}"</span>? This action cannot be undone.
                </p>
                
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                        This will permanently delete:
                      </h4>
                      <ul className="text-sm text-red-700 dark:text-red-300">
                        <li>• All document content</li>
                        <li>• Version history</li>
                        <li>• Shared access for all collaborators</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={actionLoading[`${selectedDocument.id}-delete`]}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {actionLoading[`${selectedDocument.id}-delete`] ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                      </svg>
                    ) : (
                      'Delete Document'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal Placeholder - Would integrate with the advanced sharing system */}
      {shareModalOpen && selectedDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={() => setShareModalOpen(false)} />
            
            <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Share "{selectedDocument.title}"
                </h3>
              </div>
              
              <div className="px-6 py-6">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Advanced sharing functionality would be integrated here with the comprehensive sharing system created earlier.
                </p>
                
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add custom CSS animations to your global.css
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
`
