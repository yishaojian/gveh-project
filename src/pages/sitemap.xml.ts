// src/pages/sitemap.xml.ts — PNDS 型号页 sitemap（渐进式，与 parts.json 同步）
// 静态预渲染：构建时执行生成纯静态 sitemap.xml
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

export async function GET() {
  const parts = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'src/data/parts.json'), 'utf8')
  );

  const SITE = 'https://www.pnds.com.cn';
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    { loc: '/', priority: '1.0' },
    { loc: '/bom-hub', priority: '0.8' },
    { loc: '/login', priority: '0.3' },
    { loc: '/zh', priority: '0.6' },
  ];

  const partUrls = parts.map((p) => ({
    loc: `/pn/${p.pn.replace(/\//g, '~')}`,
    priority: '0.7',
  }));

  const urls = [...staticUrls, ...partUrls];

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
