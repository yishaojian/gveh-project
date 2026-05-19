import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// 彻底移除所有多语言配置，只保留基础的 Tailwind 渲染引脚，断绝任何后台干扰
export default defineConfig({
  integrations: [tailwind()],
});