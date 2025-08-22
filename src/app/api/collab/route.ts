import { NextRequest, NextResponse } from 'next/server';

type ClientInfo = { lastSeen: number };

let documentContent = `# CollaboDoc Live Demo\n\nType here and open a second tab to see changes sync.\n\n- Real-time-ish via polling\n- Presence counter\n- Export options\n`;
let updatedAt = Date.now();
const clients: Record<string, ClientInfo> = {};

function pruneInactiveClients() {
  const now = Date.now();
  for (const [id, info] of Object.entries(clients)) {
    if (now - info.lastSeen > 15000) {
      delete clients[id];
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  if (clientId) {
    clients[clientId] = { lastSeen: Date.now() };
  }
  pruneInactiveClients();
  return NextResponse.json({ content: documentContent, updatedAt, activeClients: Object.keys(clients).length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, clientId } = body as { content?: string; clientId?: string };

    if (clientId) {
      clients[clientId] = { lastSeen: Date.now() };
    }

    if (typeof content === 'string') {
      documentContent = content;
      updatedAt = Date.now();
    }

    pruneInactiveClients();
    return NextResponse.json({ success: true, updatedAt, activeClients: Object.keys(clients).length });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
