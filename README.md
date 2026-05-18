# Veteran Electronics Hub

深圳电子老兵的硬核工业风博客 - 20年元器件采购经验分享

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🤖 自动翻译功能

本项目集成了 GitHub Actions 自动翻译工作流：

### 配置步骤

1. **获取 Gemini API Key**
   - 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
   - 创建新的 API Key

2. **配置 GitHub Secret**
   - 进入你的 GitHub 仓库
   - Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `GEMINI_API_KEY`
   - Value: 粘贴你的 Gemini API Key
   - 点击 "Add secret"

3. **使用方法**
   - 在 `src/content/blog/zh/` 目录下创建或修改 `.md` 文件
   - 提交并推送到 `main` 分支
   - GitHub Actions 会自动检测变化
   - 调用 Gemini API 翻译内容
   - 自动将英文版本保存到 `src/content/blog/en/`
   - 自动提交翻译结果

### 翻译 Prompt

工作流使用专业的电子元器件翻译 Prompt：
- 保留所有元器件型号（如 SOT-23, 10uF, 50V）
- 保留技术规格和参数
- 确保专业术语准确
- 英文语气专业、硬核

## 📁 项目结构

```
├── src/
│   ├── content/
│   │   └── blog/
│   │       ├── zh/          # 中文博客文章
│   │       └── en/          # 英文博客文章（自动生成）
│   └── pages/
│       └── index.astro      # 首页
├── .github/
│   └── workflows/
│       └── translate.yml    # 自动翻译工作流
└── package.json
```

## 🎨 设计风格

- 极简硬核工业风
- 深色模式友好
- Tailwind CSS + Astro
- 琥珀色 (amber) 主题色

## 📝 内容模块

1. **China vs Global Manufacturers** - 国产与国外大厂对比
2. **BOM Optimization Advice** - BOM 优化建议
3. **About Me** - 20年深圳电子老兵

---

Built with ⚡ Astro + 🎨 Tailwind CSS
