const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT secret for token verification
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

// Store active connections
const activeConnections = new Map();

// Authentication middleware
const authenticateConnection = async (url) => {
  try {
    const urlObj = new URL(url, 'http://localhost');
    const token = urlObj.searchParams.get('token');
    const documentId = urlObj.searchParams.get('doc');
    
    if (!token || !documentId) {
      throw new Error('Missing token or document ID');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Check if user has access to document
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_collaborators!inner(user_id)
      `)
      .eq('id', documentId)
      .or(`owner_id.eq.${userId},document_collaborators.user_id.eq.${userId}`)
      .single();

    if (error || !document) {
      throw new Error('Document not found or access denied');
    }

    return { userId, documentId, document };
  } catch (error) {
    console.error('Authentication error:', error.message);
    return null;
  }
};

// Create HTTP server
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket server is running');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', async (ws, request) => {
  try {
    // Authenticate the connection
    const auth = await authenticateConnection(request.url);
    if (!auth) {
      ws.close(1008, 'Authentication failed');
      return;
    }

    const { userId, documentId } = auth;
    const connectionId = `${documentId}-${userId}`;

    // Store connection
    activeConnections.set(connectionId, {
      ws,
      userId,
      documentId,
      connectedAt: new Date()
    });

    // Join collaboration session
    await supabase
      .from('collaboration_sessions')
      .upsert({
        document_id: documentId,
        user_id: userId,
        is_active: true,
        last_seen: new Date().toISOString()
      });

    console.log(`User ${userId} connected to document ${documentId}`);

    // Setup Y.js connection
    setupWSConnection(ws, request, {
      docName: documentId,
      gc: true,
      pingTimeout: 30000,
      upgrade: (request, socket, head) => {
        // Custom upgrade logic if needed
      }
    });

    // Handle connection close
    ws.on('close', async () => {
      activeConnections.delete(connectionId);
      
      // Update collaboration session
      await supabase
        .from('collaboration_sessions')
        .update({ 
          is_active: false,
          last_seen: new Date().toISOString()
        })
        .eq('document_id', documentId)
        .eq('user_id', userId);

      console.log(`User ${userId} disconnected from document ${documentId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      activeConnections.delete(connectionId);
    });

  } catch (error) {
    console.error('Connection setup error:', error);
    ws.close(1011, 'Internal server error');
  }
});

// Health check endpoint
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      connections: activeConnections.size,
      uptime: process.uptime()
    }));
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down Y.js server...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.YJS_PORT || 1234;
server.listen(PORT, () => {
  console.log(`Y.js WebSocket server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = { server, wss, activeConnections };
