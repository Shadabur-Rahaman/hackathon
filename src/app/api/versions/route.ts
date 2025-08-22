import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentId, version } = await req.json();

  // Save version to database
  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_data: version.content,
      message: version.message,
      author_id: userId,
      hash: version.hash,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save version' }, { status: 500 });
  }

  return NextResponse.json({ success: true, version: data });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
  }

  const { data: versions, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }

  return NextResponse.json({ versions });
}
