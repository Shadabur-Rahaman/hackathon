# CollaboDoc - Real-Time Collaborative Document Editor

A comprehensive, real-time collaborative document editor built with Next.js, Tiptap, Y.js, and Supabase. Features include live collaboration, version control, comments, sharing, and more.

## 🚀 Features

### Core Features (v1)
- **Real-time Collaboration**: Multi-user editing with live cursors and presence indicators
- **Rich Text Editor**: Powered by Tiptap with extensive formatting options
- **Version Control**: Git-like version history with branching and merge requests
- **Comments & Annotations**: Threaded comments with inline annotations
- **Document Sharing**: Secure link sharing with role-based permissions
- **Auto-save**: Automatic document saving with offline support
- **Organizations & Workspaces**: Multi-tenant architecture with workspace management

### Advanced Features (v1.5)
- **Merge Request Flow**: Git-like merge requests with review system
- **Export Options**: PDF, Markdown, DOCX, and HTML export
- **Audit Logging**: Comprehensive activity tracking
- **SSO Integration**: OAuth support (Google, GitHub)
- **Advanced Permissions**: Granular role-based access control
- **Offline Editing**: Full offline support with sync on reconnect

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Editor**: Tiptap with Y.js collaboration
- **Real-time**: Y.js WebSocket server
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **State Management**: Zustand

### Architecture Overview
```
[ Web Clients ] → [ Y.js WebSocket Server ] → [ Supabase ]
       ↓                    ↓                      ↓
[ Tiptap Editor ]    [ Real-time Sync ]    [ PostgreSQL ]
       ↓                    ↓                      ↓
[ Y.js CRDT ]        [ Presence/Awareness ]  [ Row-level Security ]
```

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Y.js WebSocket server

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dodoc
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Y.js WebSocket Configuration
NEXT_PUBLIC_YJS_WEBSOCKET_URL=ws://localhost:1234

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
```

### 4. Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `SUPABASE_SETUP.md` in your Supabase SQL editor
3. Configure authentication settings in Supabase dashboard
4. Enable real-time for required tables

### 5. Y.js WebSocket Server
Start the Y.js WebSocket server:
```bash
npm run yjs-server
```

### 6. Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Usage

### Creating Documents
1. Sign up/in to your account
2. Navigate to the dashboard
3. Click "Create Document"
4. Start editing with real-time collaboration

### Collaboration Features
- **Live Cursors**: See other users' cursors in real-time
- **Presence Indicators**: View who's currently editing
- **Comments**: Add threaded comments to specific text
- **Version History**: Track changes and restore previous versions
- **Branching**: Create feature branches for parallel work
- **Merge Requests**: Propose changes for review

### Sharing Documents
1. Click the "Share" button in the editor
2. Create a share link with specific permissions
3. Set expiry dates for temporary access
4. Invite collaborators via email

### Export Options
- **PDF**: High-quality document export
- **Markdown**: Plain text with formatting
- **DOCX**: Microsoft Word compatibility
- **HTML**: Web-ready format

## 🔧 Configuration

### Editor Configuration
The editor supports extensive customization through Tiptap extensions:

```typescript
// Custom extensions
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Table from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
// ... more extensions
```

### Y.js Configuration
Configure the Y.js WebSocket server for your environment:

```javascript
// yjs-server.js
const PORT = process.env.YJS_PORT || 1234
const JWT_SECRET = process.env.NEXTAUTH_SECRET
```

### Supabase Configuration
Enable real-time subscriptions for collaboration:

```sql
-- Enable real-time for collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE document_comments;
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy the application

### Y.js Server Deployment
Deploy the Y.js WebSocket server to a platform like:
- Railway
- Heroku
- DigitalOcean
- AWS EC2

### Database Migration
Run database migrations in production:
```sql
-- Execute the schema from SUPABASE_SETUP.md
-- Configure production environment variables
-- Set up SSL connections
```

## 🔒 Security

### Authentication
- Supabase Auth with JWT tokens
- Row-level security (RLS) policies
- Role-based access control
- Secure session management

### Data Protection
- Encrypted data transmission (WSS)
- Secure document sharing tokens
- Audit logging for sensitive actions
- GDPR-compliant data handling

### Permissions
- Document-level permissions
- Organization-level access control
- Time-limited share links
- Granular role assignments

## 📊 Performance

### Optimization Features
- **CRDT-based Collaboration**: Efficient conflict resolution
- **IndexedDB Persistence**: Offline data storage
- **Virtual Scrolling**: Large document support
- **Lazy Loading**: On-demand component loading
- **Caching**: Intelligent data caching

### Monitoring
- Real-time connection status
- Auto-save indicators
- Performance metrics
- Error tracking and logging

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

### Testing
```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Run type checking
npm run type-check
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Reference](./docs/api.md)
- [Component Library](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)

### Community
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/your-community)
- [Documentation](https://docs.collabodoc.com)

### Troubleshooting
Common issues and solutions:
- [Connection Issues](./docs/troubleshooting.md#connection)
- [Performance Problems](./docs/troubleshooting.md#performance)
- [Deployment Issues](./docs/troubleshooting.md#deployment)

## 🗺️ Roadmap

### v2.0 Features
- [ ] Advanced templates system
- [ ] Real-time voice/video collaboration
- [ ] Advanced search and filtering
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

### v2.5 Features
- [ ] AI-powered writing assistance
- [ ] Advanced analytics and insights
- [ ] Custom workflows and automation
- [ ] Enterprise SSO and compliance

---

Built with ❤️ by the CollaboDoc team
