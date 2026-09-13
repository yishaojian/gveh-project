// src/utils/blog.ts
// ==========================================
// BLOG UTILITY FUNCTIONS（基于 Astro Content Collections）
// ==========================================
// 博客已从 Supabase 迁移为 Markdown 内容集合（src/content/blog/{zh,en}/*.md）。
// 此处只读内容集合，不依赖任何数据库。
import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogLang = 'zh' | 'en';

export interface BlogPost {
  slug: string; // URL 中的 slug（不含语言目录前缀）
  lang: BlogLang;
  title: string;
  description: string;
  category: string;
  author: string;
  date: Date;
  keywords: string[];
  draft: boolean;
  entry: CollectionEntry<'blog'>;
}

// 分类 slug -> 中英文显示名（与首页 /blog/category/<slug> 保持一致）
export const CATEGORY_META: Record<string, { en: string; zh: string; icon: string }> = {
  about_us: { en: 'About Us', zh: '关于我们', icon: '🏢' },
  bom_optimization: { en: 'BOM Optimization', zh: 'BOM 优化', icon: '🔧' },
  domestic_vs_global: { en: 'Domestic vs Global', zh: '国产 VS 全球', icon: '🌍' },
};

export function categoryName(category: string, lang: BlogLang): string {
  const meta = CATEGORY_META[category];
  if (meta) return lang === 'zh' ? meta.zh : meta.en;
  return category;
}

function toPost(entry: CollectionEntry<'blog'>): BlogPost {
  // id 形如 "zh/why-pnds" 或 "en/why-pnds"
  const lang: BlogLang = entry.id.startsWith('zh/') ? 'zh' : 'en';
  const slug = entry.id.replace(/^(zh|en)\//, '');
  const data = entry.data;

  return {
    slug,
    lang,
    title: data.title,
    description: data.description,
    category: data.category,
    author: data.author,
    date: data.date,
    keywords: (data.keywords ?? '')
      .split(/[,，]/)
      .map((k) => k.trim())
      .filter(Boolean),
    draft: !!data.draft,
    entry,
  };
}

/** 返回全部非 draft 文章，可按语言过滤，按 date 倒序。 */
export async function getAllPosts(lang?: BlogLang): Promise<BlogPost[]> {
  const entries = await getCollection('blog');
  return entries
    .map(toPost)
    .filter((p) => !p.draft)
    .filter((p) => (lang ? p.lang === lang : true))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** 按 slug 与语言取单篇文章。 */
export async function getPostBySlug(slug: string, lang: BlogLang): Promise<BlogPost | null> {
  const posts = await getAllPosts(lang);
  return posts.find((p) => p.slug === slug) ?? null;
}

/** 返回去重后的分类 slug 列表。 */
export async function getCategories(lang?: BlogLang): Promise<string[]> {
  const posts = await getAllPosts(lang);
  return [...new Set(posts.map((p) => p.category))];
}
