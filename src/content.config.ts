// src/content.config.ts
// ==========================================
// BLOG CONTENT COLLECTION（Markdown 半自动发布）
// ==========================================
// 博客从 Supabase 迁移为 Markdown 入库：写入 .md 文件并构建即发布。
// 目录约定：src/content/blog/zh/*.md（中文）、src/content/blog/en/*.md（英文）。
// 语言由目录自动判断，无需在 frontmatter 里重复声明 lang。
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(), // 必填：标题
    description: z.string(), // 必填：摘要（用于列表卡片与 meta description）
    category: z.string(), // 必填：分类 slug（about_us / bom_optimization / domestic_vs_global）
    author: z.string(), // 必填：作者
    date: z.coerce.date(), // 必填：发布日期（ISO）
    keywords: z.string().optional(), // 可选：逗号分隔字符串
    lang: z.string().optional(), // 可选：语言，靠目录判断时可省略
    draft: z.boolean().optional(), // 可选：true 则不发布
  }),
});

export const collections = { blog };
