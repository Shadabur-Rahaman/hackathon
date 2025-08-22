# Supabase Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Y.js WebSocket Configuration
YJS_WEBSOCKET_URL=ws://localhost:1234
```

## Enhanced Database Schema (v1.5)

The following SQL will create the comprehensive database schema for the collaborative document editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table
CREATE TABLE public.orgs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization memberships
CREATE TABLE public.memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Workspaces table
CREATE TABLE public.workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (enhanced)
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document collaborators (enhanced permissions)
CREATE TABLE public.document_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Enhanced document versions (Git-like)
CREATE TABLE public.document_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  branch TEXT DEFAULT 'main',
  parent_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL,
  merge_parent_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  snapshot_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document heads (branch pointers)
CREATE TABLE public.document_heads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  branch TEXT NOT NULL,
  version_id UUID REFERENCES public.document_versions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, branch)
);

-- Enhanced comments with threading
CREATE TABLE public.document_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.document_comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  anchor_from INTEGER,
  anchor_to INTEGER,
  status TEXT CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration sessions (enhanced)
CREATE TABLE public.collaboration_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cursor_position JSONB,
  selection JSONB,
  awareness_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Share links
CREATE TABLE public.document_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  link_token TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('viewer', 'editor')) DEFAULT 'viewer',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Export jobs
CREATE TABLE public.document_exports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('pdf', 'md', 'docx', 'html')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  url TEXT,
  error_message TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Audit log
CREATE TABLE public.audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  meta_json JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merge requests
CREATE TABLE public.merge_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  source_branch TEXT NOT NULL,
  target_branch TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('open', 'merged', 'closed')) DEFAULT 'open',
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  merged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  merged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merge request reviews
CREATE TABLE public.merge_request_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merge_request_id UUID REFERENCES public.merge_requests(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'changes_requested')) DEFAULT 'pending',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merge_request_reviews ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Users can view orgs they are members of" ON public.orgs
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org owners and admins can update orgs" ON public.orgs
  FOR UPDATE USING (
    id IN (
      SELECT org_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Membership policies
CREATE POLICY "Users can view memberships in their orgs" ON public.memberships
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org owners and admins can manage memberships" ON public.memberships
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Workspace policies
CREATE POLICY "Users can view workspaces in their orgs" ON public.workspaces
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org owners and admins can update workspaces" ON public.workspaces
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Document policies
CREATE POLICY "Users can view documents they have access to" ON public.documents
  FOR SELECT USING (
    owner_id = auth.uid() OR
    org_id IN (
      SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
    ) OR
    id IN (
      SELECT document_id FROM public.document_collaborators WHERE user_id = auth.uid()
    ) OR
    is_public = TRUE
  );

CREATE POLICY "Users can create documents in their orgs" ON public.documents
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
    ) AND owner_id = auth.uid()
  );

CREATE POLICY "Users can update documents they own or have edit access" ON public.documents
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT document_id FROM public.document_collaborators 
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

CREATE POLICY "Users can delete documents they own" ON public.documents
  FOR DELETE USING (owner_id = auth.uid());

-- Document collaborator policies
CREATE POLICY "Users can view collaborators for documents they have access to" ON public.document_collaborators
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

CREATE POLICY "Document owners can manage collaborators" ON public.document_collaborators
  FOR ALL USING (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    )
  );

-- Document version policies
CREATE POLICY "Users can view versions for documents they have access to" ON public.document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

CREATE POLICY "Users can create versions for documents they can edit" ON public.document_versions
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    ) OR
    document_id IN (
      SELECT document_id FROM public.document_collaborators 
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

-- Document head policies
CREATE POLICY "Users can view heads for documents they have access to" ON public.document_heads
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

CREATE POLICY "Users can update heads for documents they can edit" ON public.document_heads
  FOR ALL USING (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    ) OR
    document_id IN (
      SELECT document_id FROM public.document_collaborators 
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

-- Comment policies
CREATE POLICY "Users can view comments for documents they have access to" ON public.document_comments
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

CREATE POLICY "Users can create comments for documents they have access to" ON public.document_comments
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

CREATE POLICY "Users can update their own comments" ON public.document_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments or comments on their documents" ON public.document_comments
  FOR DELETE USING (
    author_id = auth.uid() OR
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    )
  );

-- Collaboration session policies
CREATE POLICY "Users can view active sessions for documents they have access to" ON public.collaboration_sessions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

CREATE POLICY "Users can manage their own collaboration sessions" ON public.collaboration_sessions
  FOR ALL USING (user_id = auth.uid());

-- Share link policies
CREATE POLICY "Users can view share links for documents they own" ON public.document_shares
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Document owners can manage share links" ON public.document_shares
  FOR ALL USING (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    )
  );

-- Export policies
CREATE POLICY "Users can view exports for documents they have access to" ON public.document_exports
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

CREATE POLICY "Users can create exports for documents they have access to" ON public.document_exports
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

-- Audit log policies
CREATE POLICY "Users can view audit logs for their orgs" ON public.audit_log
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- Merge request policies
CREATE POLICY "Users can view merge requests for documents they have access to" ON public.merge_requests
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM public.documents 
      WHERE owner_id = auth.uid() OR
        org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
        is_public = TRUE
    )
  );

CREATE POLICY "Users can create merge requests for documents they can edit" ON public.merge_requests
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM public.documents WHERE owner_id = auth.uid()
    ) OR
    document_id IN (
      SELECT document_id FROM public.document_collaborators 
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

CREATE POLICY "Users can update merge requests they created" ON public.merge_requests
  FOR UPDATE USING (author_id = auth.uid());

-- Merge request review policies
CREATE POLICY "Users can view reviews for merge requests they have access to" ON public.merge_request_reviews
  FOR SELECT USING (
    merge_request_id IN (
      SELECT id FROM public.merge_requests 
      WHERE document_id IN (
        SELECT id FROM public.documents 
        WHERE owner_id = auth.uid() OR
          org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
          is_public = TRUE
      )
    )
  );

CREATE POLICY "Users can create reviews for merge requests they have access to" ON public.merge_request_reviews
  FOR INSERT WITH CHECK (
    merge_request_id IN (
      SELECT id FROM public.merge_requests 
      WHERE document_id IN (
        SELECT id FROM public.documents 
        WHERE owner_id = auth.uid() OR
          org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()) OR
          is_public = TRUE
      )
    )
  );

CREATE POLICY "Users can update their own reviews" ON public.merge_request_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_comments_updated_at BEFORE UPDATE ON public.document_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merge_requests_updated_at BEFORE UPDATE ON public.merge_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merge_request_reviews_updated_at BEFORE UPDATE ON public.merge_request_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create default organization for new users
CREATE OR REPLACE FUNCTION public.create_default_org()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create default organization
  INSERT INTO public.orgs (name, plan)
  VALUES (NEW.full_name || '''s Workspace', 'free')
  RETURNING id INTO new_org_id;
  
  -- Add user as owner
  INSERT INTO public.memberships (org_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');
  
  -- Create default workspace
  INSERT INTO public.workspaces (org_id, name, description)
  VALUES (new_org_id, 'General', 'Default workspace for your documents');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default org when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_org();

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_meta JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get user's primary org
  SELECT org_id INTO v_org_id
  FROM public.memberships
  WHERE user_id = auth.uid()
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Log the event
  INSERT INTO public.audit_log (org_id, actor_id, action, target_type, target_id, meta_json)
  VALUES (v_org_id, auth.uid(), p_action, p_target_type, p_target_id, p_meta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate secure share tokens
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_documents_org_id ON public.documents(org_id);
CREATE INDEX idx_documents_owner_id ON public.documents(owner_id);
CREATE INDEX idx_documents_workspace_id ON public.documents(workspace_id);
CREATE INDEX idx_document_collaborators_document_id ON public.document_collaborators(document_id);
CREATE INDEX idx_document_collaborators_user_id ON public.document_collaborators(user_id);
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_branch ON public.document_versions(branch);
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX idx_document_comments_parent_id ON public.document_comments(parent_id);
CREATE INDEX idx_collaboration_sessions_document_id ON public.collaboration_sessions(document_id);
CREATE INDEX idx_collaboration_sessions_user_id ON public.collaboration_sessions(user_id);
CREATE INDEX idx_audit_log_org_id ON public.audit_log(org_id);
CREATE INDEX idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);
```

## Setup Steps

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key from the API settings
3. Create the `.env.local` file with your credentials
4. Run the SQL schema in your Supabase SQL editor
5. Configure authentication settings in Supabase dashboard
6. Set up real-time subscriptions for the tables you want to sync
7. Configure Y.js WebSocket server (see Y.js setup below)

## Authentication Setup

In your Supabase dashboard:
1. Go to Authentication > Settings
2. Configure your site URL and redirect URLs
3. Enable the authentication providers you want to use (Email, Google, GitHub, etc.)
4. Set up email templates for verification and password reset

## Y.js WebSocket Server Setup

For real-time collaboration, you'll need to run a Y.js WebSocket server. Create a new file `yjs-server.js`:

```javascript
const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('okay');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', setupWSConnection);

server.listen(1234, () => {
  console.log('Y.js WebSocket server running on port 1234');
});
```

Install dependencies and run:
```bash
npm install ws y-websocket
node yjs-server.js
```

## Real-time Configuration

Enable real-time for these tables in Supabase:
- `documents`
- `document_collaborators`
- `document_comments`
- `collaboration_sessions`
- `merge_requests`
- `merge_request_reviews`
