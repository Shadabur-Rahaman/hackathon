import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, permission, expiresIn } = await req.json();

    // Calculate expiration date
    const expirationMap = {
      '1h': 1 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'never': null
    };

    const expirationMs = expirationMap[expiresIn as keyof typeof expirationMap];
    const expiresAt = expirationMs ? new Date(Date.now() + expirationMs).toISOString() : null;

    // Generate unique slug
    const slug = nanoid(12);
    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/share/${slug}`;

    // Store share link in database
    const { error } = await supabase.from('doc_shares').insert({
      document_id: documentId,
      creator_id: userId,
      slug: slug,
      role: permission,
      expires_at: expiresAt,
      visits: 0
    });

    if (error) {
      throw new Error('Failed to create share link');
    }

    return NextResponse.json({ 
      success: true, 
      shareUrl,
      slug,
      expiresAt
    });

  } catch (error) {
    console.error('Share link generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' }, 
      { status: 500 }
    );
  }
}
