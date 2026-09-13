#!/usr/bin/env node
// scripts/auto-translate.mjs
// ============================================================
// 中文博客 -> 英文自动翻译（带护栏版，2026-09-13 重写）
//
// 旧版问题：直接 curl Gemini 后用 jq 取 .candidates[0]...text，
// 接口失败时该值为字面量 null 并**直接覆盖**英文文章 -> 线上出现 "null" 页面。
//
// 本版护栏：
//   1) 目标英文文件已存在且不是本脚本生成的（无 autoTranslated 标记）-> 跳过，绝不覆盖人工写的
//   2) 译文正文过短(<200字符) / 非 JSON / 字段缺失 -> 视为失败，不落盘
//   3) 模型名自动探测（优先 flash），接口换名也不会挂
//   4) 任何异常只打印日志并退出，不改动文件
//
// 用法: GEMINI_API_KEY=xxx node scripts/auto-translate.mjs src/content/blog/zh/foo.md [...]
// ============================================================
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.GEMINI_API_KEY || '';
const ROOT = process.cwd();
const ZH_PREFIX = 'src/content/blog/zh/';
const EN_PREFIX = 'src/content/blog/en/';
const MIN_BODY = 200;

function log(...a) { console.log('[auto-translate]', ...a); }

function splitFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src.trim() };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    v = v.replace(/^["']|["']$/g, '');
    data[k] = v;
  }
  return { data, body: src.slice(m[0].length).trim() };
}

function yamlValue(v) { return String(v ?? '').replace(/\r?\n/g, ' ').trim(); }

async function pickModel() {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`);
    const d = await r.json();
    const models = (d.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'));
    const pref = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
    for (const p of pref) {
      const hit = models.find((m) => m.name === `models/${p}` || m.name.endsWith(`/${p}`));
      if (hit) return hit.name;
    }
    const flash = models.find((m) => /flash/i.test(m.name));
    return flash ? flash.name : (models[0] ? models[0].name : null);
  } catch (e) {
    log('模型探测失败:', e.message);
    return null;
  }
}

async function translate(model, data, body) {
  const prompt = [
    '你是资深电子元器件行业英文编辑。把下面的中文博客翻译成专业、地道的英文（面向采购与硬件工程师）。',
    '要求：保留所有型号、参数、封装（如 STM32F103C8T6 / SOT-23 / 10uF 50V）；不要添加原文没有的事实、数字或客户案例；不要输出解释。',
    '只返回 JSON，格式：{"title": "...", "description": "...", "keywords": "...", "body": "Markdown 正文（不含 YAML frontmatter）"}',
    '',
    `原标题: ${data.title || ''}`,
    `原描述: ${data.description || ''}`,
    `原关键词: ${data.keywords || ''}`,
    '',
    '原文正文：',
    body,
  ].join('\n');

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model.replace(/^models\//, '')}:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    }
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const d = await r.json();
  const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || text === 'null') throw new Error('接口返回空/无效译文');
  const out = JSON.parse(text);
  return out;
}

async function main() {
  let files = process.argv.slice(2).filter((f) => f.startsWith(ZH_PREFIX) && f.endsWith('.md'));
  if (!files.length) {
    // 无参数：扫描全部中文文章（构建期用，只补缺失的英文版）
    const dir = path.join(ROOT, ZH_PREFIX);
    try {
      files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => ZH_PREFIX + f);
    } catch (e) { files = []; }
    log('扫描到中文文章', files.length, '篇');
  }
  if (!files.length) { log('没有需要处理的中文文章，退出'); return; }
  if (!KEY) { log('缺少 GEMINI_API_KEY，退出（不做任何改动）'); process.exit(0); }

  const model = await pickModel();
  if (!model) { log('未找到可用模型，退出（不做任何改动）'); process.exit(0); }
  log('使用模型:', model);

  let ok = 0, skip = 0, fail = 0;
  for (const rel of files) {
    const srcPath = path.join(ROOT, rel);
    const outRel = EN_PREFIX + path.basename(rel);
    const outPath = path.join(ROOT, outRel);
    try {
      if (!fs.existsSync(srcPath)) { log('源文件不存在，跳过:', rel); skip++; continue; }

      if (fs.existsSync(outPath)) {
        const existing = fs.readFileSync(outPath, 'utf8');
        const ours = /^autoTranslated:\s*true\s*$/m.test(existing);
        if (!ours) { log('英文版已存在且为人工撰写，跳过（不覆盖）:', outRel); skip++; continue; }
        log('英文版为自动生成，将更新:', outRel);
      }

      const { data, body } = splitFrontmatter(fs.readFileSync(srcPath, 'utf8'));
      if (!body || body.length < 50) { log('原文正文过短，跳过:', rel); skip++; continue; }

      const t = await translate(model, data, body);
      const newBody = String(t.body || '').trim();
      if (!newBody || newBody === 'null' || newBody.length < MIN_BODY) {
        log('译文不合格（过短/为空），不落盘:', rel); fail++; continue;
      }

      const fm = [
        '---',
        `title: ${yamlValue(t.title || data.title)}`,
        `description: ${yamlValue(t.description || data.description)}`,
        `category: ${yamlValue(data.category)}`,
        `author: ${yamlValue(data.author || 'PNDS Team')}`,
        `date: ${yamlValue(data.date)}`,
        t.keywords || data.keywords ? `keywords: ${yamlValue(t.keywords || data.keywords)}` : null,
        'autoTranslated: true',
        `translatedFrom: ${rel}`,
        '---',
        '',
      ].filter((x) => x !== null).join('\n');

      fs.writeFileSync(outPath, fm + newBody + '\n');
      log('生成:', outRel, `(${newBody.length} 字符)`);
      ok++;
    } catch (e) {
      fail++;
      log('失败（不落盘）:', rel, '-', e.message);
    }
  }
  log(`完成: 生成 ${ok} / 跳过 ${skip} / 失败 ${fail}`);
}

main().catch((e) => { log('异常退出（未改动文件）:', e.message); process.exit(0); });
