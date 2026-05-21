/**
 * BOM 双通知功能快速测试脚本
 * 使用方法：node test-bom-submission.js
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4323;
const BASE_URL = `http://localhost:${PORT}`;

console.log('🧪 BOM 双通知功能测试脚本');
console.log('='.repeat(50));
console.log('');

// 测试 1：检查 BOM HUB 页面是否可访问
function testPageAccessibility() {
  return new Promise((resolve, reject) => {
    console.log('📄 测试 1: 检查 BOM HUB 页面可访问性...');
    
    http.get(`${BASE_URL}/bom-hub`, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ BOM HUB 页面可访问 (200 OK)');
        resolve(true);
      } else {
        console.log(`❌ BOM HUB 页面访问失败 (${res.statusCode})`);
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

// 测试 2：检查 API 接口是否存在
function testApiEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('');
    console.log('🔌 测试 2: 检查 API 接口可用性...');
    
    const postData = 'email=test@example.com';
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/submit-bom',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`API 响应状态码：${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 303 || res.statusCode === 200) {
          console.log('✅ API 接口响应正常');
          resolve(true);
        } else {
          console.log(`响应数据：${data}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (e) => {
      console.log(`❌ API 请求失败：${e.message}`);
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

// 测试 3：检查环境变量配置
function testEnvironmentVariables() {
  return new Promise((resolve, reject) => {
    console.log('');
    console.log('🔐 测试 3: 检查环境变量配置...');
    
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env 文件不存在');
      console.log('💡 提示：请复制 .env.example 为 .env 并填写配置');
      resolve(false);
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const checks = [
      { key: 'RESEND_API_KEY', pattern: /RESEND_API_KEY=re_\w+/ },
      { key: 'ADMIN_EMAIL', pattern: /ADMIN_EMAIL=[\w@.]+/ },
      { key: 'SERVER_CHAN_KEY', pattern: /SERVER_CHAN_KEY=SCT\w+/ }
    ];
    
    let allConfigured = true;
    
    checks.forEach(({ key, pattern }) => {
      const match = envContent.match(pattern);
      if (match) {
        const value = match[0].split('=')[1];
        const masked = value.substring(0, 5) + '***' + value.substring(value.length - 3);
        console.log(`✅ ${key}: ${masked}`);
      } else {
        console.log(`❌ ${key}: 未配置或格式错误`);
        allConfigured = false;
      }
    });
    
    if (allConfigured) {
      console.log('✅ 所有环境变量已正确配置');
    } else {
      console.log(' 提示：请参考 .env.example 文件配置环境变量');
    }
    
    resolve(allConfigured);
  });
}

// 测试 4：检查提交表单结构
function testFormStructure() {
  return new Promise((resolve, reject) => {
    console.log('');
    console.log('📝 测试 4: 检查提交表单结构...');
    
    http.get(`${BASE_URL}/bom-hub`, (res) => {
      let html = '';
      res.on('data', (chunk) => html += chunk);
      res.on('end', () => {
        const checks = [
          { name: '表单 action', pattern: /action="\/api\/submit-bom"/ },
          { name: '表单 method', pattern: /method="POST"/ },
          { name: 'enctype', pattern: /enctype="multipart\/form-data"/ },
          { name: 'email 输入框', pattern: /name="email"/ },
          { name: 'bomText 文本域', pattern: /name="bomText"/ },
          { name: 'file 上传框', pattern: /name="file"/ },
          { name: '提交按钮', pattern: /type="submit"/ }
        ];
        
        let allPresent = true;
        
        checks.forEach(({ name, pattern }) => {
          if (pattern.test(html)) {
            console.log(`✅ ${name}: 存在`);
          } else {
            console.log(`❌ ${name}: 缺失`);
            allPresent = false;
          }
        });
        
        if (allPresent) {
          console.log('✅ 表单结构完整');
          resolve(true);
        } else {
          console.log('❌ 表单结构不完整');
          resolve(false);
        }
      });
    }).on('error', reject);
  });
}

// 主测试流程
async function runTests() {
  console.log('🚀 开始测试...\n');
  
  const results = {
    pageAccessible: false,
    apiEndpoint: false,
    envConfigured: false,
    formStructure: false
  };
  
  try {
    results.pageAccessible = await testPageAccessibility();
  } catch (e) {
    console.log(`错误：${e.message}`);
  }
  
  try {
    results.apiEndpoint = await testApiEndpoint();
  } catch (e) {
    console.log(`错误：${e.message}`);
  }
  
  results.envConfigured = await testEnvironmentVariables();
  
  try {
    results.formStructure = await testFormStructure();
  } catch (e) {
    console.log(`错误：${e.message}`);
  }
  
  // 总结
  console.log('');
  console.log('='.repeat(50));
  console.log(' 测试结果总结:');
  console.log('='.repeat(50));
  console.log(`页面可访问性：${results.pageAccessible ? '✅' : '❌'}`);
  console.log(`API 接口可用性：${results.apiEndpoint ? '✅' : '❌'}`);
  console.log(`环境变量配置：${results.envConfigured ? '✅' : '❌'}`);
  console.log(`表单结构完整性：${results.formStructure ? '✅' : '❌'}`);
  console.log('');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('🎉 所有基础测试通过！');
    console.log('');
    console.log('下一步：');
    console.log('1. 打开浏览器访问：http://localhost:4323/bom-hub');
    console.log('2. 填写真实邮箱和 BOM 内容');
    console.log('3. 提交表单并检查邮箱和微信是否收到通知');
    console.log('');
    console.log('📧 如果未收到通知，请检查：');
    console.log('   - Resend API Key 是否正确');
    console.log('   - ADMIN_EMAIL 是否配置');
    console.log('   - ServerChan Key 是否有效');
    console.log('');
  } else {
    console.log('⚠️  部分测试未通过，请先修复问题');
    console.log('');
    console.log('修复指南：');
    console.log('1. 确保开发服务器正在运行 (npm run dev)');
    console.log('2. 复制 .env.example 为 .env 并填写配置');
    console.log('3. 检查 BOM HUB 页面是否正常加载');
    console.log('');
  }
  
  console.log('📖 详细测试指南请查看：TESTING_GUIDE.md');
  console.log('');
}

// 运行测试
runTests().catch(console.error);
