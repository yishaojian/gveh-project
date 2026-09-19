// src/pages/sitemap-all.xml.ts — 与 /sitemap.xml 内容完全一致的第二条 sitemap 路径。
// 用途：GSC 里 /sitemap.xml 的提交记录若卡在「待处理 / 无法抓取」（isPending=true 长期不动），
//       换一条 URL 重新提交可以强制 Google 新建队列记录；内容一致，不会造成重复收录。
import { GET as baseGET } from './sitemap.xml';

export const prerender = true;
export const GET = baseGET;
