# Supabase 配置指南

## 🚀 步骤 1：创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 注册账号并登录
2. 点击 "New Project" 创建新项目
3. 填写项目名称（如 `pnds-bom-hub`），设置数据库密码
4. 等待项目初始化完成（约 1-2 分钟）

## 🚀 步骤 2：获取 API 密钥

1. 进入项目后，点击左侧菜单的 **Settings** → **API**
2. 复制以下两个值到你的 `.env` 文件：
   - `SUPABASE_URL` (项目 URL)
   - `SUPABASE_ANON_KEY` (anon public key)

## 🚀 步骤 3：创建存储桶

1. 点击左侧菜单的 **Storage**
2. 点击 **Create a new bucket**
3. 填写：
   - **Name**: `bom-files`
   - **Public access**: ✅ 勾选 "Make this bucket public"
4. 点击 **Create bucket**

## 🚀 步骤 4：执行数据库初始化脚本

1. 点击左侧菜单的 **SQL Editor**
2. 点击 **New query**
3. 将 `supabase/migrations/20260521_init.sql` 的内容复制粘贴到编辑器
4. 点击 **Run** 执行

### ✅ 执行成功后应该看到：
```
✅ Profiles table created with 4 records
✅ BOM Submissions table created with 0 records
```

## 🚀 步骤 5：配置环境变量

在项目根目录创建 `.env` 文件：

```env
# Resend API Key (Email Service)
RESEND_API_KEY=your_resend_api_key_here

# Admin Email (Receive BOM inquiries)
ADMIN_EMAIL=yishaojian@hotmail.com

# ServerChan Key (WeChat Push Notification)
SERVER_CHAN_KEY=your_serverchan_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Sales Team WeChat Keys (Optional)
# SALES_CN_WECHAT_KEY=SCTxxxxxxx
# SALES_GLOBAL_WECHAT_KEY=SCTxxxxxxx
# SALES_EU_WECHAT_KEY=SCTxxxxxxx
```

## 🚀 步骤 6：启动开发服务器

```bash
npm run dev
```

## 📋 验证清单

| 验证项 | 检查方法 |
|--------|----------|
| Supabase 连接 | 查看终端日志是否有连接错误 |
| 文件上传 | 在 BOM Hub 提交带文件的表单，查看 Supabase Storage |
| 数据存储 | 在 Supabase Table Editor 查看 `bom_submissions` 表 |
| 智能分流 | 使用不同域名邮箱测试，查看日志中的分配结果 |

## 🐛 常见问题

### Q: 文件上传失败？
- 确保存储桶名称是 `bom-files`
- 确保存储桶设置为公开访问
- 检查 Supabase 存储权限配置

### Q: 数据库写入失败？
- 确保 SQL 脚本已执行成功
- 检查 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确
- 确认表结构已创建

### Q: 智能分流不工作？
- 检查 `sales-routing.ts` 中的销售 ID 是否与数据库中的 ID 匹配
- 确保默认销售数据已正确插入