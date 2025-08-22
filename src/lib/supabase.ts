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
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceKey 
  ? createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
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
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Ensure consistent formatting
        password: password.trim()
      });

      if (error) {
        console.error('Supabase auth error:', error);
        
        // Handle specific error cases
        if (error.message === 'Invalid login credentials') {
          return {
            success: false,
            error: {
              message: 'Invalid email or password. Please check your credentials.',
              code: 'INVALID_CREDENTIALS'
            }
          };
        } else if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: {
              message: 'Please confirm your email address before signing in.',
              code: 'EMAIL_NOT_CONFIRMED'
            }
          };
        }
        
        return {
          success: false,
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: {
            message: 'Authentication failed - no user session created',
            code: 'NO_SESSION'
          }
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };

    } catch (err) {
      console.error('Auth sign-in error:', err);
      return {
        success: false,
        error: {
          message: 'Network error. Please try again.',
          code: 'NETWORK_ERROR'
        }
      };
    }
  },

  signUp: async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        needsConfirmation: !data.session // If no session, email confirmation is required
      };

    } catch (err) {
      return {
        success: false,
        error: {
          message: 'Network error. Please try again.',
          code: 'NETWORK_ERROR'
        }
      };
    }
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
  // Get documents accessible to the current user
  getDocuments: async (orgId?: string, workspaceId?: string): Promise<Document[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Use the RLS-enabled function that returns documents with user roles
    const { data, error } = await supabase
      .rpc('get_user_documents', { user_uuid: user.id });

    if (error) throw error;

    // Filter by org and workspace if specified
    let filteredData = data || [];
    if (orgId) {
      filteredData = filteredData.filter((doc: any) => doc.org_id === orgId);
    }
    if (workspaceId) {
      filteredData = filteredData.filter((doc: any) => doc.workspace_id === workspaceId);
    }

    return filteredData;
  },

  // Get a single document with permission check
  getDocument: async (id: string): Promise<Document | null> => {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        owner:profiles(*),
        org:orgs(*),
        workspace:workspaces(*),
        collaborators:document_collaborators(
          user_id,
          role,
          profiles!inner(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }

    return data;
  },

  // Check user's role for a specific document
  getUserCollaboration: async (documentId: string, userId: string) => {
    const { data, error } = await supabase
      .from('document_collaborators')
      .select('role, permissions')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking collaboration:', error);
      throw error;
    }

    return data;
  },

  // Check if user can edit a document
  canUserEdit: async (documentId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .rpc('can_user_edit_document', { 
        doc_id: documentId, 
        user_uuid: user.id 
      });

    if (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }

    return data || false;
  },

  // Create a new document
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

  // Update document with permission check
  updateDocument: async (id: string, updates: Partial<Document>): Promise<Document> => {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
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

  // Delete document (only owners can delete due to RLS)
  deleteDocument: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ======== COLLABORATOR MANAGEMENT ========

  // Add a collaborator to a document
  addCollaborator: async (documentId: string, userEmail: string, role: 'viewer' | 'editor') => {
    const { data, error } = await supabase
      .rpc('add_document_collaborator', {
        doc_id: documentId,
        user_email: userEmail,
        collab_role: role
      });

    if (error) throw error;
    return data;
  },

  // Remove a collaborator from a document
  removeCollaborator: async (documentId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('document_collaborators')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Update collaborator role
  updateCollaboratorRole: async (documentId: string, userId: string, role: 'viewer' | 'editor'): Promise<void> => {
    const { error } = await supabase
      .from('document_collaborators')
      .update({ role })
      .eq('document_id', documentId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get all collaborators for a document
  getCollaborators: async (documentId: string) => {
    const { data, error } = await supabase
      .from('document_collaborators')
      .select(`
        *,
        profiles!inner(
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('document_id', documentId);

    if (error) throw error;
    return data || [];
  },

  // ======== INVITATION MANAGEMENT ========

  // Create an invitation
  createInvitation: async (
    documentId: string,
    inviteeEmail: string,
    role: 'viewer' | 'editor',
    expiresInDays: number = 7
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { data, error } = await supabase
      .from('document_invitations')
      .insert({
        document_id: documentId,
        inviter_id: user.id,
        invitee_email: inviteeEmail,
        role,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Accept an invitation
  acceptInvitation: async (inviteToken: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('document_invitations')
      .select('*')
      .eq('invite_token', inviteToken)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires_at)) {
      throw new Error('Invitation has expired');
    }

    // Add user as collaborator
    await documentApi.addCollaborator(
      invitation.document_id,
      invitation.invitee_email,
      invitation.role
    );

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('document_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateError) throw updateError;

    return invitation;
  },

  // Get invitations for a document
  getDocumentInvitations: async (documentId: string) => {
    const { data, error } = await supabase
      .from('document_invitations')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ======== SHARE LINK MANAGEMENT ========

  // Create a share link
  createShareLink: async (
    documentId: string,
    role: 'viewer' | 'editor',
    expiresInDays?: number,
    maxVisits?: number
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const slug = crypto.randomUUID().replace(/-/g, '').substring(0, 12);
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from('doc_shares')
      .insert({
        document_id: documentId,
        creator_id: user.id,
        slug,
        role,
        expires_at: expiresAt,
        max_visits: maxVisits
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${slug}`
    };
  },

  // Get share link by slug
  getShareLink: async (slug: string) => {
    const { data, error } = await supabase
      .from('doc_shares')
      .select(`
        *,
        document:documents(
          id,
          title,
          content,
          is_public,
          owner:profiles(full_name, email)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Check if link has expired
    if (data.expires_at && new Date() > new Date(data.expires_at)) {
      return null;
    }

    // Check if max visits exceeded
    if (data.max_visits && data.visits >= data.max_visits) {
      return null;
    }

    return data;
  },

  // Increment share link visits
  incrementShareVisits: async (slug: string) => {
    const { error } = await supabase
      .from('doc_shares')
      .update({
        visits: supabase.sql`visits + 1`,
        last_accessed: new Date().toISOString()
      })
      .eq('slug', slug);

    if (error) console.error('Error incrementing visits:', error);
  },

  // Get share links for a document
  getDocumentShareLinks: async (documentId: string) => {
    const { data, error } = await supabase
      .from('doc_shares')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Delete a share link
  deleteShareLink: async (slug: string) => {
    const { error } = await supabase
      .from('doc_shares')
      .delete()
      .eq('slug', slug);

    if (error) throw error;
  },

  // ======== VERSION MANAGEMENT ========

  // Create a document version
  createVersion: async (
    documentId: string,
    content: any,
    message: string,
    branch: string = 'main'
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const hash = btoa(JSON.stringify(content)).slice(0, 8);

    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        author_id: user.id,
        message,
        version_data: content,
        hash,
        branch
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get versions for a document
  getDocumentVersions: async (documentId: string, branch: string = 'main') => {
    const { data, error } = await supabase
      .from('document_versions')
      .select(`
        *,
        author:profiles(full_name, email, avatar_url)
      `)
      .eq('document_id', documentId)
      .eq('branch', branch)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a specific version
  getVersion: async (versionId: string) => {
    const { data, error } = await supabase
      .from('document_versions')
      .select(`
        *,
        author:profiles(full_name, email, avatar_url)
      `)
      .eq('id', versionId)
      .single();

    if (error) throw error;
    return data;
  },

  // ======== COMMENT MANAGEMENT ========

  // Get comments for a document
  getDocumentComments: async (documentId: string) => {
    const { data, error } = await supabase
      .from('document_comments')
      .select(`
        *,
        author:profiles(full_name, email, avatar_url),
        replies:document_comments(
          *,
          author:profiles(full_name, email, avatar_url)
        )
      `)
      .eq('document_id', documentId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a comment
  createComment: async (
    documentId: string,
    authorId: string,
    content: string,
    parentId?: number,
    selection?: { from: number; to: number }
  ) => {
    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        author_id: authorId,
        content,
        parent_id: parentId,
        anchor_from: selection?.from,
        anchor_to: selection?.to
      })
      .select(`
        *,
        author:profiles(full_name, email, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Update a comment
  updateComment: async (commentId: string, content: string) => {
    const { data, error } = await supabase
      .from('document_comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Resolve/unresolve a comment
  toggleCommentResolution: async (commentId: string, resolved: boolean) => {
    const { data, error } = await supabase
      .from('document_comments')
      .update({
        status: resolved ? 'resolved' : 'open',
        resolved_at: resolved ? new Date().toISOString() : null
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
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
