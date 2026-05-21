# BOM 双通知功能测试指南

## 📋 测试前准备

### 1. 获取免费 API Key

#### Resend (邮件服务)
1. 访问：https://resend.com/api-keys
2. 注册/登录账号
3. 点击 "Create API Key"
4. 复制 API Key（格式：`re_xxxxxxxxxxxxx`）
5. **免费额度**：每天 100 封邮件

#### ServerChan (微信推送)
1. 访问：https://sct.ftqq.com/
2. 使用微信扫描二维码登录
3. 获取 SendKey（在 "发送消息" 页面）
4. 复制 SendKey（格式：`SCTxxxxxxxxxxxxx`）
5. **免费额度**：每天 100 条推送

### 2. 配置环境变量

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入真实配置：
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ADMIN_EMAIL=your-email@qq.com
   SERVER_CHAN_KEY=SCTxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **重要**：`.env` 文件已被 `.gitignore` 排除，不会被提交到 Git

### 3. 重启开发服务器

如果服务器正在运行，先停止（Ctrl+C），然后重启：
```bash
npm run dev
```

---

## 🧪 测试步骤

### 测试 1：基础表单提交（无附件）

1. 访问：http://localhost:4322/bom-hub
2. 填写表单：
   - **联系邮箱**: `test@example.com`
   - **BOM 内容**: 
     ```
     型号, 描述，数量
     STM32F103C8T6, MCU, 100
     0805 10k, 电阻，500
     ```
   - **上传文件**: （留空）
3. 点击 "Submit BOM"

**预期结果**：
- ✅ 页面跳转到 `/bom-hub?status=success`
- ✅ 你的邮箱收到一封邮件（标题：`新 BOM 询价 - test@example.com`）
- ✅ 微信收到一条推送（标题：`新 BOM 询价`）

---

### 测试 2：带附件的完整提交

1. 准备一个测试文件（如 `test-bom.xlsx` 或 `test-bom.csv`）
2. 访问：http://localhost:4322/bom-hub
3. 填写表单：
   - **联系邮箱**: `customer@example.com`
   - **BOM 内容**: （可选填写）
   - **上传文件**: 选择准备好的测试文件
4. 点击 "Submit BOM"

**预期结果**：
- ✅ 页面跳转到 `/bom-hub?status=success`
- ✅ 邮箱收到邮件，包含：
  - 客户邮箱信息
  - BOM 文本内容
  - **附件文件**（原始上传的文件）
- ✅ 微信收到推送，包含：
  - 客户邮箱
  - 提交时间
  - 附件文件名

---

### 测试 3：错误处理测试

#### 测试 3.1：缺少邮箱
1. 访问：http://localhost:4322/bom-hub
2. 不填写邮箱，直接提交

**预期结果**：
- ✅ 返回 400 错误
- ✅ 提示 "Email is required"

#### 测试 3.2：超大文件（可选）
1. 上传一个超过 4.5MB 的文件

**预期结果**：
- ✅ 应该被 Vercel 限制或正常处理（取决于配置）

---

## 📊 验证清单

### 邮件验证
- [ ] 邮件是否成功发送？
- [ ] 邮件标题是否正确？（`新 BOM 询价 - {客户邮箱}`）
- [ ] 邮件内容是否完整？
  - [ ] 客户邮箱
  - [ ] 提交时间
  - [ ] BOM 文本内容
  - [ ] 附件文件（如果有上传）
- [ ] 邮件格式是否美观？（HTML 排版）

### 微信推送验证
- [ ] 微信是否收到推送？
- [ ] 推送标题是否正确？（`新 BOM 询价`）
- [ ] 推送内容是否包含关键信息？
  - [ ] 客户邮箱
  - [ ] 提交时间
  - [ ] BOM 内容摘要
  - [ ] 附件信息

### 页面交互验证
- [ ] 提交后是否成功跳转？
- [ ] URL 是否包含 `?status=success`？
- [ ] 如果出错，URL 是否包含 `?status=error`？

---

##  故障排查

### 问题 1：没有收到邮件
**可能原因**：
- Resend API Key 配置错误
- ADMIN_EMAIL 配置错误
- Resend 账号未验证邮箱

**解决方法**：
1. 检查 `.env` 文件中的 `RESEND_API_KEY` 是否正确
2. 确认 `ADMIN_EMAIL` 是否填写正确
3. 访问 Resend 控制台查看发送日志：https://resend.com/emails

### 问题 2：没有收到微信推送
**可能原因**：
- ServerChan Key 配置错误
- ServerChan 服务暂时不可用

**解决方法**：
1. 检查 `.env` 文件中的 `SERVER_CHAN_KEY` 是否正确
2. 访问 ServerChan 控制台查看发送记录
3. 手动测试推送：在浏览器打开
   ```
   https://sctapi.ftqq.com/YOUR_KEY.send?title=测试&desp=这是一条测试消息
   ```

### 问题 3：控制台报错
**查看日志**：
```bash
# 在终端查看开发服务器的日志输出
```

常见错误：
- `Error: Invalid API Key` → 检查 `.env` 配置
- `Error: Network error` → 检查网络连接
- `Error: Missing credentials` → 确认环境变量已正确加载

---

## 🚀 部署到 Vercel 后的测试

### 1. 配置 Vercel 环境变量

1. 访问：https://vercel.com/dashboard
2. 选择你的项目
3. Settings → Environment Variables
4. 添加以下变量：
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `SERVER_CHAN_KEY`
5. 重新部署项目

### 2. 测试生产环境

1. 访问你的 Vercel 域名：`https://your-project.vercel.app/bom-hub`
2. 提交测试表单
3. 验证邮件和微信推送

---

## 📈 性能指标

### 响应时间
- **本地开发环境**：< 2 秒
- **Vercel 生产环境**：< 5 秒

### 推送到达时间
- **邮件**：通常在 30 秒内到达
- **微信**：通常在 5 秒内到达

### 并发处理
- **Resend 免费额度**：100 封/天
- **ServerChan 免费额度**：100 条/天
- **超出后**：升级套餐或等待次日重置

---

## ✅ 测试完成报告模板

```
测试时间：2026-05-21
测试环境：本地开发 / Vercel 生产

测试结果：
- [ ] 邮件通知：✅ 成功 / ❌ 失败
- [ ] 微信推送：✅ 成功 / ❌ 失败
- [ ] 页面跳转：✅ 成功 / ❌ 失败

问题记录：
1. [描述遇到的问题]
2. [解决方案]

下一步计划：
- [ ] 配置生产环境
- [ ] 优化邮件模板
- [ ] 添加更多通知渠道
```

---

## 🎯 成功标准

**全部测试通过的标准**：
1. ✅ 邮件和微信都能在 5 分钟内收到通知
2. ✅ 邮件内容完整，包含所有关键信息
3. ✅ 微信推送及时，信息准确
4. ✅ 页面跳转正常，用户体验流畅
5. ✅ 错误处理正确，无崩溃

**恭喜！如果全部通过，你的 BOM 双通知系统就已经完美运行了！** 🎉
