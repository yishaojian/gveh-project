const fs = require('fs');

const content = `---
title: "Login"
---

<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <title>登录 - PNDS 元器件中心</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .min-h-screen {
      min-height: 100vh;
    }
    .bg-gradient-to-br {
      background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%);
    }
    .flex {
      display: flex;
    }
    .items-center {
      align-items: center;
    }
    .justify-center {
      justify-content: center;
    }
    .p-4 {
      padding: 1rem;
    }
    .w-full {
      width: 100%;
    }
    .max-w-md {
      max-width: 28rem;
    }
    .bg-gray-800\/50 {
      background-color: rgba(31, 41, 55, 0.5);
    }
    .backdrop-blur-sm {
      backdrop-filter: blur(8px);
    }
    .rounded-2xl {
      border-radius: 1rem;
    }
    .shadow-2xl {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .p-8 {
      padding: 2rem;
    }
    .border {
      border-width: 1px;
    }
    .border-gray-700 {
      border-color: #374151;
    }
    .text-center {
      text-align: center;
    }
    .mb-8 {
      margin-bottom: 2rem;
    }
    .w-16 {
      width: 4rem;
    }
    .h-16 {
      height: 4rem;
    }
    .bg-gradient-to-r {
      background: linear-gradient(90deg, #f59e0b, #ea580c);
    }
    .rounded-xl {
      border-radius: 0.75rem;
    }
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    .mb-4 {
      margin-bottom: 1rem;
    }
    .text-2xl {
      font-size: 1.5rem;
    }
    .font-bold {
      font-weight: 700;
    }
    .text-white {
      color: #fff;
    }
    .text-gray-400 {
      color: #9ca3af;
    }
    .text-sm {
      font-size: 0.875rem;
    }
    .mt-2 {
      margin-top: 0.5rem;
    }
    .mb-6 {
      margin-bottom: 1.5rem;
    }
    .bg-gray-700\/50 {
      background-color: rgba(55, 65, 81, 0.5);
    }
    .rounded-lg {
      border-radius: 0.5rem;
    }
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    .rounded-md {
      border-radius: 0.375rem;
    }
    .font-medium {
      font-weight: 500;
    }
    .transition-all {
      transition: all 0.2s;
    }
    .bg-amber-500 {
      background-color: #f59e0b;
    }
    .hover\\:text-white:hover {
      color: #fff;
    }
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
    .hidden {
      display: none;
    }
    .block {
      display: block;
    }
    .text-gray-300 {
      color: #d1d5db;
    }
    .py-3 {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }
    .bg-gray-700 {
      background-color: #374151;
    }
    .border-gray-600 {
      border-color: #4b5563;
    }
    .placeholder-gray-400::placeholder {
      color: #9ca3af;
    }
    .focus\\:outline-none:focus {
      outline: none;
    }
    .focus\\:ring-2:focus {
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.5);
    }
    .focus\\:ring-amber-500:focus {
      --tw-ring-color: #f59e0b;
    }
    .focus\\:border-transparent:focus {
      border-color: transparent;
    }
    .bg-green-500\\/20 {
      background-color: rgba(34, 197, 94, 0.2);
    }
    .text-green-400 {
      color: #4ade80;
    }
    .bg-red-500\\/20 {
      background-color: rgba(239, 68, 68, 0.2);
    }
    .text-red-400 {
      color: #f87171;
    }
    .hover\\:from-amber-600:hover {
      --tw-gradient-from: #d97706;
    }
    .hover\\:to-orange-600:hover {
      --tw-gradient-to: #dc2626;
    }
    .focus\\:ring-offset-2:focus {
      --tw-ring-offset-width: 2px;
    }
    .focus\\:ring-offset-gray-800:focus {
      --tw-ring-offset-color: #1f2937;
    }
    .disabled\\:opacity-50:disabled {
      opacity: 0.5;
    }
    .disabled\\:cursor-not-allowed:disabled {
      cursor: not-allowed;
    }
    .cursor-pointer {
      cursor: pointer;
    }
    .float-right {
      float: right;
    }
    .clear-both {
      clear: both;
    }
  </style>
</head>
<body>
  <div class="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div class="float-right mb-4">
          <button id="langBtn" class="px-3 py-1 text-sm text-gray-400 hover:text-white transition-all cursor-pointer border border-gray-600 rounded-md">
            English
          </button>
        </div>
        <div class="clear-both"></div>
        
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-r rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h1 id="title" class="text-2xl font-bold text-white">PNDS 元器件中心</h1>
          <p id="subtitle" class="text-gray-400 text-sm mt-2">专业电子元器件询价平台</p>
        </div>

        <div class="flex mb-6 bg-gray-700/50 rounded-lg p-1">
          <button id="loginBtn" class="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-amber-500 text-white transition-all cursor-pointer">登录</button>
          <button id="registerBtn" class="flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-400 hover:text-white transition-all cursor-pointer">注册</button>
        </div>

        <div class="space-y-4">
          <div id="nameField" class="hidden">
            <label id="nameLabel" class="block text-gray-300 text-sm font-medium mb-2">姓名</label>
            <input id="nameInput" type="text" placeholder="请输入您的姓名" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"/>
          </div>

          <div>
            <label id="emailLabel" class="block text-gray-300 text-sm font-medium mb-2">邮箱</label>
            <input id="emailInput" type="email" placeholder="请输入邮箱地址" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"/>
          </div>

          <div>
            <label id="passwordLabel" class="block text-gray-300 text-sm font-medium mb-2">密码</label>
            <input id="passwordInput" type="password" placeholder="请输入密码" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"/>
          </div>

          <div id="messageDiv" class="hidden p-3 rounded-lg text-sm"></div>

          <button id="submitBtn" class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all cursor-pointer">登录</button>
        </div>

        <div id="footerText" class="mt-6 text-center text-gray-400 text-sm">
          <p>登录后查看您的询价记录和订单状态</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const isLogin = { value: true };
    const isChinese = { value: true };

    const translations = {
      en: {
        title: 'PNDS Component Hub',
        subtitle: 'Professional Electronic Components Inquiry Platform',
        login: 'Login',
        register: 'Register',
        name: 'Name',
        namePlaceholder: 'Enter your name',
        email: 'Email',
        emailPlaceholder: 'Enter email address',
        password: 'Password',
        passwordPlaceholder: 'Enter password',
        footer: 'View your inquiry records and order status after login',
        fillEmailPassword: 'Please fill email and password',
        fillName: 'Please fill name',
        operationFailed: 'Operation failed, please retry',
        langButton: '中文'
      },
      zh: {
        title: 'PNDS 元器件中心',
        subtitle: '专业电子元器件询价平台',
        login: '登录',
        register: '注册',
        name: '姓名',
        namePlaceholder: '请输入您的姓名',
        email: '邮箱',
        emailPlaceholder: '请输入邮箱地址',
        password: '密码',
        passwordPlaceholder: '请输入密码',
        footer: '登录后查看您的询价记录和订单状态',
        fillEmailPassword: '请填写邮箱和密码',
        fillName: '请填写姓名',
        operationFailed: '操作失败，请重试',
        langButton: 'English'
      }
    };

    function updateLanguage() {
      const lang = isChinese.value ? 'zh' : 'en';
      const t = translations[lang];
      
      document.getElementById('title').textContent = t.title;
      document.getElementById('subtitle').textContent = t.subtitle;
      document.getElementById('loginBtn').textContent = t.login;
      document.getElementById('registerBtn').textContent = t.register;
      document.getElementById('nameLabel').textContent = t.name;
      document.getElementById('nameInput').placeholder = t.namePlaceholder;
      document.getElementById('emailLabel').textContent = t.email;
      document.getElementById('emailInput').placeholder = t.emailPlaceholder;
      document.getElementById('passwordLabel').textContent = t.password;
      document.getElementById('passwordInput').placeholder = t.passwordPlaceholder;
      document.getElementById('footerText').innerHTML = '<p>' + t.footer + '</p>';
      document.getElementById('langBtn').textContent = t.langButton;
      document.getElementById('submitBtn').textContent = isLogin.value ? t.login : t.register;
      document.documentElement.lang = isChinese.value ? 'zh-CN' : 'en';
    }

    document.getElementById('langBtn').addEventListener('click', () => {
      isChinese.value = !isChinese.value;
      updateLanguage();
    });

    document.getElementById('loginBtn').addEventListener('click', () => {
      isLogin.value = true;
      document.getElementById('loginBtn').classList.add('bg-amber-500', 'text-white');
      document.getElementById('loginBtn').classList.remove('text-gray-400');
      document.getElementById('registerBtn').classList.remove('bg-amber-500', 'text-white');
      document.getElementById('registerBtn').classList.add('text-gray-400');
      document.getElementById('nameField').classList.add('hidden');
      const t = translations[isChinese.value ? 'zh' : 'en'];
      document.getElementById('submitBtn').textContent = t.login;
    });

    document.getElementById('registerBtn').addEventListener('click', () => {
      isLogin.value = false;
      document.getElementById('registerBtn').classList.add('bg-amber-500', 'text-white');
      document.getElementById('registerBtn').classList.remove('text-gray-400');
      document.getElementById('loginBtn').classList.remove('bg-amber-500', 'text-white');
      document.getElementById('loginBtn').classList.add('text-gray-400');
      document.getElementById('nameField').classList.remove('hidden');
      const t = translations[isChinese.value ? 'zh' : 'en'];
      document.getElementById('submitBtn').textContent = t.register;
    });

    document.getElementById('submitBtn').addEventListener('click', async () => {
      const email = document.getElementById('emailInput').value;
      const password = document.getElementById('passwordInput').value;
      const name = document.getElementById('nameInput').value;
      const messageDiv = document.getElementById('messageDiv');
      const t = translations[isChinese.value ? 'zh' : 'en'];

      messageDiv.classList.add('hidden');

      if (!email || !password) {
        showMessage(t.fillEmailPassword, false);
        return;
      }

      if (!isLogin.value && !name) {
        showMessage(t.fillName, false);
        return;
      }

      try {
        const endpoint = isLogin.value ? '/api/login' : '/api/register';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        const result = await response.json();
        
        if (result.success) {
          showMessage(result.message, true);
          const role = result.profile?.role || 'customer';
          setTimeout(() => {
            window.location.href = '/dashboard/' + role;
          }, 1500);
        } else {
          showMessage(result.message, false);
        }
      } catch (error) {
        showMessage(t.operationFailed, false);
      }
    });

    function showMessage(message, isSuccess) {
      const messageDiv = document.getElementById('messageDiv');
      messageDiv.textContent = message;
      messageDiv.classList.remove('hidden');
      if (isSuccess) {
        messageDiv.classList.remove('bg-red-500/20', 'text-red-400');
        messageDiv.classList.add('bg-green-500/20', 'text-green-400');
      } else {
        messageDiv.classList.remove('bg-green-500/20', 'text-green-400');
        messageDiv.classList.add('bg-red-500/20', 'text-red-400');
      }
    }
  </script>
</body>
</html>
`;

fs.writeFileSync('src/pages/login.astro', content, { encoding: 'utf8' });
console.log('File written successfully');
