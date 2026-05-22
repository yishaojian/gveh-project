import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { getUserFromSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await getUserFromSession(cookies);
    
    if (!user || (user.role !== 'sales' && user.role !== 'customer' && user.role !== 'admin')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const titleCn = formData.get('title_cn') as string;
    const titleEn = formData.get('title_en') as string;
    const contentCn = formData.get('content_cn') as string;
    const contentEn = formData.get('content_en') as string;
    const keywords = formData.get('keywords') as string;

    const { data, error } = await supabase
      .from('blogs')
      .insert({
        author_id: user.id,
        title_cn: titleCn,
        title_en: titleEn,
        content_cn: contentCn,
        content_en: contentEn,
        keywords: keywords,
        status: 'pending_review'
      })
      .select();

    if (error) {
      console.error('Error creating blog:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create blog' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, blog: data[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
