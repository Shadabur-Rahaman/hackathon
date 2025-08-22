import { redirect } from 'next/navigation';
import { resolveShareSlug } from '@/lib/share';
import { supabase } from '@/lib/supabase';

export default async function SharePage({ params }: { params: { slug: string } }) {
  const { data, error } = await resolveShareSlug(params.slug);

  if (error || !data) return <p>Invalid or expired link.</p>;
  
  if (data.expires_at && new Date() > new Date(data.expires_at)) {
    return <p>This invitation link has expired.</p>;
  }

  // Mark invitation as accessed
  await supabase
    .from('doc_shares')
    .update({ 
      visits: (data.visits || 0) + 1,
      last_accessed: new Date().toISOString()
    })
    .eq('slug', params.slug);

  // Redirect with collaboration parameters
  redirect(`/doc/${data.document_id}?shareRole=${data.role}&invite=true`);
}
