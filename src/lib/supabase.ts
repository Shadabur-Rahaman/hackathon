import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Enhanced Types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: any;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings?: any;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
  user?: Profile;
  org?: Organization;
}

export interface Workspace {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  settings?: any;
  created_at: string;
  updated_at: string;
  org?: Organization;
}

export interface Document {
  id: string;
  org_id: string;
  workspace_id?: string;
  owner_id: string;
  title: string;
  content: any;
  settings?: any;
  is_public: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  org?: Organization;
  workspace?: Workspace;
}

export interface DocumentCollaborator {
  id: string;
  document_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions?: any;
  created_at: string;
  user?: Profile;
  document?: Document;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  branch: string;
  parent_id?: string;
  merge_parent_id?: string;
  author_id?: string;
  message: string;
  snapshot_json: any;
  created_at: string;
  author?: Profile;
  document?: Document;
  parent?: DocumentVersion;
  merge_parent?: DocumentVersion;
}

export interface DocumentHead {
  id: string;
  document_id: string;
  branch: string;
  version_id: string;
  created_at: string;
  document?: Document;
  version?: DocumentVersion;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  parent_id?: string;
  author_id: string;
  content: string;
  anchor_from?: number;
  anchor_to?: number;
  status: 'open' | 'resolved';
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  document?: Document;
  parent?: DocumentComment;
  replies?: DocumentComment[];
}

export interface CollaborationSession {
  id: string;
  document_id: string;
  user_id: string;
  cursor_position?: any;
  selection?: any;
  awareness_data?: any;
  is_active: boolean;
  last_seen: string;
  created_at: string;
  user?: Profile;
  document?: Document;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  link_token: string;
  role: 'viewer' | 'editor';
  expires_at?: string;
  created_by: string;
  created_at: string;
  document?: Document;
  creator?: Profile;
}

export interface DocumentExport {
  id: string;
  document_id: string;
  type: 'pdf' | 'md' | 'docx' | 'html';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  error_message?: string;
  created_by: string;
  created_at: string;
  completed_at?: string;
  document?: Document;
  creator?: Profile;
}

export interface AuditLog {
  id: string;
  org_id: string;
  actor_id?: string;
  action: string;
  target_type: string;
  target_id?: string;
  meta_json?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  org?: Organization;
  actor?: Profile;
}

export interface MergeRequest {
  id: string;
  document_id: string;
  source_branch: string;
  target_branch: string;
  title: string;
  description?: string;
  status: 'open' | 'merged' | 'closed';
  author_id: string;
  merged_by?: string;
  merged_at?: string;
  created_at: string;
  updated_at: string;
  document?: Document;
  author?: Profile;
  merged_by_user?: Profile;
  reviews?: MergeRequestReview[];
}

export interface MergeRequestReview {
  id: string;
  merge_request_id: string;
  reviewer_id: string;
  status: 'pending' | 'approved' | 'changes_requested';
  comment?: string;
  created_at: string;
  updated_at: string;
  merge_request?: MergeRequest;
  reviewer?: Profile;
}

// Profile API
export const profileApi = {
  getCurrentProfile: async (): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  updateProfile: async (updates: Partial<Profile>): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  createProfile: async (profile: Partial<Profile>): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Authentication API
export const authApi = {
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }
};

// Organization API
export const organizationApi = {
  getOrganizations: async (): Promise<Organization[]> => {
    const { data, error } = await supabase
      .from('orgs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getOrganization: async (id: string): Promise<Organization> => {
    const { data, error } = await supabase
      .from('orgs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createOrganization: async (name: string, plan: string = 'free'): Promise<Organization> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('orgs')
      .insert({ name, plan })
      .select()
      .single();

    if (error) throw error;

    // Add user as owner
    await supabase
      .from('memberships')
      .insert({
        org_id: data.id,
        user_id: user.id,
        role: 'owner'
      });

    return data;
  },

  updateOrganization: async (id: string, updates: Partial<Organization>): Promise<Organization> => {
    const { data, error } = await supabase
      .from('orgs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Membership API
export const membershipApi = {
  getMemberships: async (orgId: string): Promise<Membership[]> => {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        *,
        user:profiles(*),
        org:orgs(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  addMember: async (orgId: string, userId: string, role: string = 'member'): Promise<Membership> => {
    const { data, error } = await supabase
      .from('memberships')
      .insert({
        org_id: orgId,
        user_id: userId,
        role
      })
      .select(`
        *,
        user:profiles(*),
        org:orgs(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  updateMember: async (membershipId: string, updates: Partial<Membership>): Promise<Membership> => {
    const { data, error } = await supabase
      .from('memberships')
      .update(updates)
      .eq('id', membershipId)
      .select(`
        *,
        user:profiles(*),
        org:orgs(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  removeMember: async (membershipId: string): Promise<void> => {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', membershipId);

    if (error) throw error;
  }
};

// Workspace API
export const workspaceApi = {
  getWorkspaces: async (orgId: string): Promise<Workspace[]> => {
    const { data, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        org:orgs(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  createWorkspace: async (orgId: string, name: string, description?: string): Promise<Workspace> => {
    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        org_id: orgId,
        name,
        description
      })
      .select(`
        *,
        org:orgs(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  updateWorkspace: async (id: string, updates: Partial<Workspace>): Promise<Workspace> => {
    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        org:orgs(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  deleteWorkspace: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Enhanced Document API
export const documentApi = {
  getDocuments: async (orgId?: string, workspaceId?: string): Promise<Document[]> => {
    let query = supabase
      .from('documents')
      .select(`
        *,
        owner:profiles(*),
        org:orgs(*),
        workspace:workspaces(*)
      `)
      .order('updated_at', { ascending: false });

    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getDocument: async (id: string): Promise<Document> => {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        owner:profiles(*),
        org:orgs(*),
        workspace:workspaces(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createDocument: async (
    orgId: string, 
    title: string, 
    workspaceId?: string,
    content: any = {}, 
    isPublic: boolean = false
  ): Promise<Document> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .insert({
        org_id: orgId,
        workspace_id: workspaceId,
        title,
        content,
        owner_id: user.id,
        is_public: isPublic
      })
      .select(`
        *,
        owner:profiles(*),
        org:orgs(*),
        workspace:workspaces(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  updateDocument: async (id: string, updates: Partial<Document>): Promise<Document> => {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        owner:profiles(*),
        org:orgs(*),
        workspace:workspaces(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Enhanced Collaboration API
export const collaborationApi = {
  joinSession: async (documentId: string): Promise<CollaborationSession> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('collaboration_sessions')
      .upsert({
        document_id: documentId,
        user_id: user.id,
        is_active: true,
        last_seen: new Date().toISOString()
      })
      .select(`
        *,
        user:profiles(*),
        document:documents(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  leaveSession: async (documentId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('collaboration_sessions')
      .update({ is_active: false })
      .eq('document_id', documentId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  updateCursor: async (documentId: string, cursorPosition: any, selection?: any, awarenessData?: any): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('collaboration_sessions')
      .update({
        cursor_position: cursorPosition,
        selection,
        awareness_data: awarenessData,
        last_seen: new Date().toISOString()
      })
      .eq('document_id', documentId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  getActiveCollaborators: async (documentId: string): Promise<CollaborationSession[]> => {
    const { data, error } = await supabase
      .from('collaboration_sessions')
      .select(`
        *,
        user:profiles(*),
        document:documents(*)
      `)
      .eq('document_id', documentId)
      .eq('is_active', true)
      .gte('last_seen', new Date(Date.now() - 30000).toISOString()); // Last 30 seconds

    if (error) throw error;
    return data || [];
  }
};

// Enhanced Version Control API
export const versionApi = {
  createVersion: async (
    documentId: string, 
    content: any, 
    message: string, 
    branch: string = 'main',
    parentId?: string
  ): Promise<DocumentVersion> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        snapshot_json: content,
        message,
        branch,
        parent_id: parentId,
        author_id: user.id
      })
      .select(`
        *,
        author:profiles(*),
        document:documents(*),
        parent:document_versions(*),
        merge_parent:document_versions(*)
      `)
      .single();

    if (error) throw error;

    // Update branch head
    await supabase
      .from('document_heads')
      .upsert({
        document_id: documentId,
        branch,
        version_id: data.id
      });

    return data;
  },

  getDocumentVersions: async (documentId: string, branch?: string): Promise<DocumentVersion[]> => {
    let query = supabase
      .from('document_versions')
      .select(`
        *,
        author:profiles(*),
        document:documents(*),
        parent:document_versions(*),
        merge_parent:document_versions(*)
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (branch) {
      query = query.eq('branch', branch);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getBranches: async (documentId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('document_heads')
      .select('branch')
      .eq('document_id', documentId);

    if (error) throw error;
    return data?.map(head => head.branch) || [];
  },

  createBranch: async (documentId: string, branchName: string, fromBranch: string = 'main'): Promise<DocumentHead> => {
    // Get the latest version from the source branch
    const { data: sourceHead } = await supabase
      .from('document_heads')
      .select('version_id')
      .eq('document_id', documentId)
      .eq('branch', fromBranch)
      .single();

    if (!sourceHead) {
      throw new Error(`Source branch ${fromBranch} not found`);
    }

    // Create new branch head
    const { data, error } = await supabase
      .from('document_heads')
      .insert({
        document_id: documentId,
        branch: branchName,
        version_id: sourceHead.version_id
      })
      .select(`
        *,
        document:documents(*),
        version:document_versions(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  mergeBranch: async (
    documentId: string, 
    sourceBranch: string, 
    targetBranch: string, 
    message: string
  ): Promise<DocumentVersion> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the latest versions from both branches
    const { data: sourceHead } = await supabase
      .from('document_heads')
      .select('version_id')
      .eq('document_id', documentId)
      .eq('branch', sourceBranch)
      .single();

    const { data: targetHead } = await supabase
      .from('document_heads')
      .select('version_id')
      .eq('document_id', documentId)
      .eq('branch', targetBranch)
      .single();

    if (!sourceHead || !targetHead) {
      throw new Error('Branch not found');
    }

    // Create merge commit
    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        snapshot_json: {}, // This would be the merged content
        message,
        branch: targetBranch,
        parent_id: targetHead.version_id,
        merge_parent_id: sourceHead.version_id,
        author_id: user.id
      })
      .select(`
        *,
        author:profiles(*),
        document:documents(*),
        parent:document_versions(*),
        merge_parent:document_versions(*)
      `)
      .single();

    if (error) throw error;

    // Update target branch head
    await supabase
      .from('document_heads')
      .update({ version_id: data.id })
      .eq('document_id', documentId)
      .eq('branch', targetBranch);

    return data;
  }
};

// Enhanced Comment API
export const commentApi = {
  createComment: async (
    documentId: string, 
    content: string, 
    parentId?: string,
    anchorFrom?: number,
    anchorTo?: number
  ): Promise<DocumentComment> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        parent_id: parentId,
        user_id: user.id,
        content,
        anchor_from: anchorFrom,
        anchor_to: anchorTo
      })
      .select(`
        *,
        user:profiles(*),
        document:documents(*),
        parent:document_comments(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  getDocumentComments: async (documentId: string): Promise<DocumentComment[]> => {
    const { data, error } = await supabase
      .from('document_comments')
      .select(`
        *,
        user:profiles(*),
        document:documents(*),
        parent:document_comments(*)
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  updateComment: async (commentId: string, updates: Partial<DocumentComment>): Promise<DocumentComment> => {
    const { data, error } = await supabase
      .from('document_comments')
      .update(updates)
      .eq('id', commentId)
      .select(`
        *,
        user:profiles(*),
        document:documents(*),
        parent:document_comments(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    const { error } = await supabase
      .from('document_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  resolveComment: async (commentId: string): Promise<DocumentComment> => {
    const { data, error } = await supabase
      .from('document_comments')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        *,
        user:profiles(*),
        document:documents(*),
        parent:document_comments(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};

// Share API
export const shareApi = {
  createShareLink: async (
    documentId: string, 
    role: 'viewer' | 'editor' = 'viewer',
    expiresAt?: Date
  ): Promise<DocumentShare> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate secure token
    const { data: tokenData } = await supabase.rpc('generate_share_token');
    const linkToken = tokenData || crypto.randomUUID();

    const { data, error } = await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        link_token: linkToken,
        role,
        expires_at: expiresAt?.toISOString(),
        created_by: user.id
      })
      .select(`
        *,
        document:documents(*),
        creator:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  getShareLinks: async (documentId: string): Promise<DocumentShare[]> => {
    const { data, error } = await supabase
      .from('document_shares')
      .select(`
        *,
        document:documents(*),
        creator:profiles(*)
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  deleteShareLink: async (shareId: string): Promise<void> => {
    const { error } = await supabase
      .from('document_shares')
      .delete()
      .eq('id', shareId);

    if (error) throw error;
  },

  validateShareToken: async (token: string): Promise<DocumentShare | null> => {
    const { data, error } = await supabase
      .from('document_shares')
      .select(`
        *,
        document:documents(*),
        creator:profiles(*)
      `)
      .eq('link_token', token)
      .is('expires_at', null)
      .or(`expires_at.gt.${new Date().toISOString()}`)
      .single();

    if (error) return null;
    return data;
  }
};

// Export API
export const exportApi = {
  createExport: async (
    documentId: string, 
    type: 'pdf' | 'md' | 'docx' | 'html'
  ): Promise<DocumentExport> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('document_exports')
      .insert({
        document_id: documentId,
        type,
        created_by: user.id
      })
      .select(`
        *,
        document:documents(*),
        creator:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  getExports: async (documentId: string): Promise<DocumentExport[]> => {
    const { data, error } = await supabase
      .from('document_exports')
      .select(`
        *,
        document:documents(*),
        creator:profiles(*)
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  updateExport: async (exportId: string, updates: Partial<DocumentExport>): Promise<DocumentExport> => {
    const { data, error } = await supabase
      .from('document_exports')
      .update(updates)
      .eq('id', exportId)
      .select(`
        *,
        document:documents(*),
        creator:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};

// Audit API
export const auditApi = {
  logEvent: async (
    action: string,
    targetType: string,
    targetId?: string,
    meta?: any
  ): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Don't log if not authenticated

    await supabase.rpc('log_audit_event', {
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_meta: meta || {}
    });
  },

  getAuditLog: async (orgId: string, limit: number = 100): Promise<AuditLog[]> => {
    const { data, error } = await supabase
      .from('audit_log')
      .select(`
        *,
        org:orgs(*),
        actor:profiles(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

// Merge Request API
export const mergeRequestApi = {
  createMergeRequest: async (
    documentId: string,
    sourceBranch: string,
    targetBranch: string,
    title: string,
    description?: string
  ): Promise<MergeRequest> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('merge_requests')
      .insert({
        document_id: documentId,
        source_branch: sourceBranch,
        target_branch: targetBranch,
        title,
        description,
        author_id: user.id
      })
      .select(`
        *,
        document:documents(*),
        author:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  getMergeRequests: async (documentId: string): Promise<MergeRequest[]> => {
    const { data, error } = await supabase
      .from('merge_requests')
      .select(`
        *,
        document:documents(*),
        author:profiles(*),
        merged_by_user:profiles(*)
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  updateMergeRequest: async (id: string, updates: Partial<MergeRequest>): Promise<MergeRequest> => {
    const { data, error } = await supabase
      .from('merge_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        document:documents(*),
        author:profiles(*),
        merged_by_user:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  createReview: async (
    mergeRequestId: string,
    status: 'pending' | 'approved' | 'changes_requested',
    comment?: string
  ): Promise<MergeRequestReview> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('merge_request_reviews')
      .insert({
        merge_request_id: mergeRequestId,
        reviewer_id: user.id,
        status,
        comment
      })
      .select(`
        *,
        merge_request:merge_requests(*),
        reviewer:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};

// Real-time API
export const realtimeApi = {
  subscribeToDocument: (documentId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`document:${documentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `id=eq.${documentId}`
      }, callback)
      .subscribe();
  },

  subscribeToCollaboration: (documentId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`collaboration:${documentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collaboration_sessions',
        filter: `document_id=eq.${documentId}`
      }, callback)
      .subscribe();
  },

  subscribeToComments: (documentId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`comments:${documentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'document_comments',
        filter: `document_id=eq.${documentId}`
      }, callback)
      .subscribe();
  },

  subscribeToVersions: (documentId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`versions:${documentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'document_versions',
        filter: `document_id=eq.${documentId}`
      }, callback)
      .subscribe();
  },

  subscribeToMergeRequests: (documentId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`merge-requests:${documentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'merge_requests',
        filter: `document_id=eq.${documentId}`
      }, callback)
      .subscribe();
  },

  broadcastCursor: (documentId: string, cursorPosition: any) => {
    return supabase
      .channel(`cursor:${documentId}`)
      .send({
        type: 'broadcast',
        event: 'cursor-update',
        payload: cursorPosition
      });
  }
};
