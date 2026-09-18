// src/pages/sitemap.xml.ts — PNDS 型号页 sitemap（渐进式，与 parts.json 同步）
// 静态预渲染：构建时执行生成纯静态 sitemap.xml
// 同时收录博客索引页与所有非 draft 文章（英文站 /blog 与中文站 /zh/blog 分别列）。
import fs from 'node:fs';
import path from 'node:path';
import { getAllPosts } from '../utils/blog';

export const prerender = true;

export async function GET() {
  const parts = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'src/data/parts.json'), 'utf8')
  );

  const SITE = 'https://www.pnds.com.cn';
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    { loc: '/', priority: '1.0' },
    { loc: '/search', priority: '0.8' },
    { loc: '/bom-hub', priority: '0.8' },
    { loc: '/login', priority: '0.3' },
    { loc: '/zh', priority: '0.6' },
    { loc: '/zh/search', priority: '0.8' },
  ];

  const partUrls = parts.map((p) => ({
    loc: `/pn/${p.pn.replace(/\//g, '~')}`,
    priority: '0.7',
  }));

  // 丝印反查页（/marking-code/<码>）与索引页
  let markingUrls = [{ loc: '/marking-code', priority: '0.7' }];
  try {
    const markings = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'src/data/markings.json'), 'utf8')
    );
    markingUrls = markingUrls.concat(
      markings.map((m) => ({
        loc: `/marking-code/${String(m.code).replace(/\//g, '~')}`,
        priority: '0.6',
      }))
    );
  } catch (e) {
    // 未导出丝印数据时跳过
  }

  // 博客：索引页 + 所有非 draft 文章
  const posts = await getAllPosts();
  const blogUrls = [
    { loc: '/blog', priority: '0.8' },
    { loc: '/zh/blog', priority: '0.8' },
    ...posts.map((p) => ({
      loc: `${p.lang === 'zh' ? '/zh/blog' : '/blog'}/${p.slug}`,
      priority: '0.7',
    })),
  ];

  const urls = [...staticUrls, ...partUrls, ...markingUrls, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
