import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { getUserFromSession } from '../../../lib/auth';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const user = await getUserFromSession(cookies);
    
    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users!author_id (
          name,
          email
        )
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending blogs:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch blogs' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ blogs: data }),
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
