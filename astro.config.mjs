import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  // Astro 5 默认开启 checkOrigin（CSRF 防护），但 Vercel 代理下内部 URL 与对外域名不一致，
  // 会导致所有表单 POST 被判为跨站并返回 403（“Cross-site POST form submissions are forbidden”）。
  // 本站 /api/submit-bom、/api/login、/api/register 都是给自家表单用的公开端点，故关闭该检查。
  security: { checkOrigin: false },
  adapter: vercel(),
});
