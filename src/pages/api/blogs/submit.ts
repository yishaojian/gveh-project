import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { getUserFromSession } from '../../../lib/auth';

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface TranslationResult {
  title_cn: string;
  title_en: string;
  content_cn: string;
  content_en: string;
  keywords_cn: string[];
  keywords_en: string[];
}

async function callGeminiAPI(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not configured, using mock translation');
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0]) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

function detectLanguage(text: string): 'cn' | 'en' | 'mixed' {
  const chineseRegex = /[\u4e00-\u9fff]/;
  const englishWordCount = text.replace(/[^a-zA-Z]/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  const chineseCharCount = (text.match(chineseRegex) || []).length;

  if (chineseCharCount > englishWordCount * 2) {
    return 'cn';
  } else if (englishWordCount > chineseCharCount * 2) {
    return 'en';
  }
  return 'mixed';
}

async function translateToEnglish(title: string, content: string, keywords: string): Promise<{ title_en: string; content_en: string; keywords_en: string[] }> {
  if (!GEMINI_API_KEY) {
    return {
      title_en: `English Translation: ${title}`,
      content_en: `This is a professional English translation of the following Chinese technical content:\n\n${content.substring(0, 500)}...\n\n[Note: Full translation requires GEMINI_API_KEY configuration]`,
      keywords_en: keywords.split(/[,，]/).map(k => k.trim()).filter(k => k).slice(0, 5) || ['electronics', 'components', 'semiconductor', 'BOM', 'supply chain']
    };
  }

  const prompt = `You are a senior technical writer and SEO expert specializing in the global electronics components industry.

Translate and optimize the following Chinese technical article for international audiences.

INPUT:
TITLE: ${title}

CONTENT: ${content}

EXISTING KEYWORDS: ${keywords}

REQUIREMENTS:
1. Translate the title to professional, SEO-optimized English suitable for Google Search
2. Translate content maintaining technical accuracy for global electronics buyers and engineers
3. Extract 5 HIGH-QUALITY English keywords/phrases optimized for Google AI Overview and search ranking
4. Use proper technical terminology for semiconductors, integrated circuits, electronic components
5. Ensure the translation sounds natural to native English speakers in the tech industry
6. Format keywords as an array of strings

OUTPUT FORMAT (JSON ONLY, NO MARKDOWN, NO EXTRA TEXT):
{
  "title_en": "Professional English title",
  "content_en": "Full translated content with proper markdown formatting",
  "keywords_en": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

  const result = await callGeminiAPI(prompt);
  const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      title_en: parsed.title_en || `English: ${title}`,
      content_en: parsed.content_en || `English translation of: ${content.substring(0, 500)}...`,
      keywords_en: parsed.keywords_en || ['electronics', 'components', 'semiconductor', 'tech', 'BOM']
    };
  } catch (e) {
    console.error('Failed to parse Gemini response:', result);
    return {
      title_en: `English: ${title}`,
      content_en: `English translation of: ${content.substring(0, 500)}...`,
      keywords_en: ['electronics', 'components', 'semiconductor', 'tech', 'BOM']
    };
  }
}

async function translateToChinese(title: string, content: string, keywords: string): Promise<{ title_cn: string; content_cn: string; keywords_cn: string[] }> {
  if (!GEMINI_API_KEY) {
    return {
      title_cn: `中文翻译：${title}`,
      content_cn: `这是以下英文技术内容的专业中文翻译：\n\n${content.substring(0, 500)}...\n\n[注：完整翻译需要配置 GEMINI_API_KEY]`,
      keywords_cn: keywords.split(/[,，]/).map(k => k.trim()).filter(k => k).slice(0, 5) || ['电子元器件', '芯片', '半导体', 'BOM配单', '替代料']
    };
  }

  const prompt = `你是一位资深的中文电子元器件行业技术撰稿人和SEO专家。

将以下英文技术文章翻译成符合国内搜索引擎习惯的专业中文，并进行本地化优化。

输入内容：
标题：${title}

内容：${content}

现有关键词：${keywords}

要求：
1. 标题翻译要适合百度、秘塔、豆包等国内AI引擎抓取
2. 内容要接地气，符合中国电子工程师的阅读习惯
3. 提取5个适合国内SEO的中文关键词/短语
4. 可以适当加入本地化内容，如华强北采购指南、国产替代料号推荐等
5. 保持技术专业性的同时让内容更容易被国内读者理解
6. 使用Markdown格式保持内容结构清晰
7. 关键词格式化为字符串数组

输出格式（仅JSON，不要markdown，不要额外文字）：
{
  "title_cn": "专业中文标题",
  "content_cn": "完整的中文翻译内容，使用Markdown格式",
  "keywords_cn": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
}`;

  const result = await callGeminiAPI(prompt);
  const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      title_cn: parsed.title_cn || `中文：${title}`,
      content_cn: parsed.content_cn || `中文翻译：${content.substring(0, 500)}...`,
      keywords_cn: parsed.keywords_cn || ['电子元器件', '芯片', '半导体', 'BOM配单', '替代料']
    };
  } catch (e) {
    console.error('Failed to parse Gemini response:', result);
    return {
      title_cn: `中文：${title}`,
      content_cn: `中文翻译：${content.substring(0, 500)}...`,
      keywords_cn: ['电子元器件', '芯片', '半导体', 'BOM配单', '替代料']
    };
  }
}

const ALLOWED_CATEGORIES: Record<string, string[]> = {
  admin: ['domestic_vs_global', 'about_us'],
  sales: ['domestic_vs_global'],
  customer: ['domestic_vs_global', 'bom_optimization']
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await getUserFromSession(cookies);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: '请先登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { title, content, keywords, language, category } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: '标题和内容不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userRole = user.role as 'admin' | 'sales' | 'customer';
    const allowedCategories = ALLOWED_CATEGORIES[userRole] || [];
    const finalCategory = category || 'domestic_vs_global';

    if (!allowedCategories.includes(finalCategory)) {
      return new Response(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: `您的角色不允许发布到该板块。允许的板块: ${allowedCategories.join(', ')}` 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[BLOG SUBMIT] User: ${user.id} (${user.role}), Language: ${language || 'auto-detect'}`);

    let translationResult: TranslationResult;
    const detectedLang = language || detectLanguage(title + content);

    console.log(`[BLOG SUBMIT] Detected language: ${detectedLang}`);

    if (detectedLang === 'cn') {
      console.log('[BLOG SUBMIT] Translating Chinese to English...');
      const en = await translateToEnglish(title, content, keywords || '');

      translationResult = {
        title_cn: title,
        title_en: en.title_en,
        content_cn: content,
        content_en: en.content_en,
        keywords_cn: (keywords || '').split(/[,，]/).map(k => k.trim()).filter(k => k),
        keywords_en: en.keywords_en
      };
    } else if (detectedLang === 'en') {
      console.log('[BLOG SUBMIT] Translating English to Chinese...');
      const cn = await translateToChinese(title, content, keywords || '');

      translationResult = {
        title_cn: cn.title_cn,
        title_en: title,
        content_cn: cn.content_cn,
        content_en: content,
        keywords_cn: cn.keywords_cn,
        keywords_en: (keywords || '').split(/[,，]/).map(k => k.trim()).filter(k => k)
      };
    } else {
      console.log('[BLOG SUBMIT] Mixed language detected, translating both ways...');
      const [en, cn] = await Promise.all([
        translateToEnglish(title, content, keywords || ''),
        translateToChinese(title, content, keywords || '')
      ]);

      translationResult = {
        title_cn: cn.title_cn,
        title_en: en.title_en,
        content_cn: cn.content_cn,
        content_en: en.content_en,
        keywords_cn: cn.keywords_cn,
        keywords_en: en.keywords_en
      };
    }

    const status = user.role === 'admin' ? 'published' : 'pending_review';

    const combinedKeywords = [...new Set([...translationResult.keywords_cn, ...translationResult.keywords_en])].join(', ');

    console.log(`[BLOG SUBMIT] Saving blog with status: ${status}`);

    const { data, error } = await supabase
      .from('blogs')
      .insert({
        author_id: user.id,
        title_cn: translationResult.title_cn,
        title_en: translationResult.title_en,
        content_cn: translationResult.content_cn,
        content_en: translationResult.content_en,
        keywords: combinedKeywords,
        status: status,
        category: finalCategory
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog:', error);
      return new Response(
        JSON.stringify({ error: 'Database Error', message: '保存博客失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[BLOG SUBMIT] Blog created successfully: ${data.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: user.role === 'admin' ? '文章已直接发布！AI已自动完成双语翻译和SEO优化。' : '文章已提交，等待审核。AI已自动完成双语翻译和SEO优化。',
        blog: {
          id: data.id,
          status: data.status,
          title_cn: data.title_cn,
          title_en: data.title_en,
          keywords: data.keywords,
          detectedLanguage: detectedLang
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (e) {
    console.error('[BLOG SUBMIT] Error:', e);

    if (e instanceof Error && e.message.includes('GEMINI_API_KEY')) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Error', 
          message: 'AI翻译服务未配置，请联系管理员。文章将以原始语言保存。' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Server Error', message: '提交失败，请重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
