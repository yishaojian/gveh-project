import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users!author_id (
          name,
          email
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Error fetching blog:', error);
      return new Response(
        JSON.stringify({ error: 'Blog not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ blog: data }),
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
