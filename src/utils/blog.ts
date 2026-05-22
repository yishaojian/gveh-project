// src/utils/blog.ts
// ==========================================
// BLOG UTILITY FUNCTIONS
// ==========================================

import { supabase } from '../lib/supabase';

export async function getBlogById(id: string) {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users!author_id (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog:', error);
      return null;
    }

    return {
      ...data,
      author_name: data.author?.name || 'Anonymous'
    };
  } catch (e) {
    console.error('Failed to fetch blog:', e);
    return {
      id,
      title_cn: '示例博客文章',
      title_en: 'Sample Blog Post',
      content_cn: '这是一篇示例博客文章的内容。\n\n在这里您可以添加更多段落。',
      content_en: 'This is the content of a sample blog post.\n\nYou can add more paragraphs here.',
      status: 'published',
      keywords: '电子元器件, 技术文章, 替代方案',
      created_at: new Date().toISOString(),
      author_name: '示例作者'
    };
  }
}

export async function getPendingBlogs() {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users!author_id (
          name
        )
      `)
      .eq('status', 'pending_review');

    if (error) {
      console.error('Error fetching pending blogs:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      author_name: item.author?.name || 'Anonymous'
    }));
  } catch (e) {
    console.error('Failed to fetch pending blogs:', e);
    return [];
  }
}

export async function updateBlogStatus(id: string, status: 'published' | 'rejected') {
  try {
    const { error } = await supabase
      .from('blogs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating blog status:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to update blog status:', e);
    return false;
  }
}
