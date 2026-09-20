// src/utils/partUrl.ts —— 型号页 URL 的统一 slug（唯一来源）
// 背景：型号里含 `/`（Astro 路径段不能含 /，用 ~ 替代）与 `#`/`?`（在 URL 里会被当锚点/查询，
// 必须百分号编码，否则请求只到达 `#` 之前的部分 → 线上 404；文件名仍是字面 `#`，服务器解码后能命中）。
// 实测：`/pn/LT1764EFE%23PBF` → 200；裸 `#` → 404。
export function partSlug(pn: string | number): string {
  return String(pn)
    .replace(/\//g, '~')
    .replace(/#/g, '%23')
    .replace(/\?/g, '%3F');
}

export function partUrl(pn: string | number): string {
  return `/pn/${partSlug(pn)}`;
}

export const SITE = 'https://www.pnds.com.cn';

export function partAbsoluteUrl(pn: string | number): string {
  return `${SITE}${partUrl(pn)}`;
}
