import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { getUserFromSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await getUserFromSession(cookies);
    
    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: '无权限执行此操作' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { blog_id: blogId, action } = await request.json();
    
    if (!blogId || !action) {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let newStatus;
    if (action === 'approve') {
      newStatus = 'published';
    } else if (action === 'reject') {
      newStatus = 'pending_review';
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action', message: '无效操作' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('blogs')
      .update({ status: newStatus })
      .eq('id', blogId)
      .select();

    if (error) {
      console.error('Error updating blog:', error);
      return new Response(
        JSON.stringify({ error: 'Database Error', message: '更新博客状态失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Not Found', message: '博客文章不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action === 'approve' ? '文章已成功发布！中英双语版本同时上线。' : '操作完成',
        blog: data[0] 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
