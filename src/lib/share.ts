import { nanoid }  from 'nanoid';
import { supabase } from './supabase';

/**  Create or update a share-link row and return the absolute URL */
export async function createShareLink(
  documentId : string,
  role       : 'viewer' | 'editor',
  expiresAt  : Date | null = null
) {
  const slug = nanoid(10);                     // e.g. “QwErTy1234”
  await supabase.from('doc_shares').insert({
    slug,
    document_id: documentId,
    role,
    expires_at : expiresAt ?? null,
  });
  return `${process.env.NEXT_PUBLIC_SITE_URL}/share/${slug}`;
}

/** Look-up function used by the /share route */
export async function resolveShareSlug(slug: string) {
  return supabase
    .from('doc_shares')
    .select(
      'document_id, role, expires_at, visits, max_visits, pass_hash',
    )
    .eq('slug', slug)
    .single();
}
