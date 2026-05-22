// 简单测试脚本
async function testLogin() {
  const url = 'http://localhost:4324/api/login';
  const data = { identifier: 'admin@pnds.com', password: 'Yiyi0058' };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('登录结果:', result);
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}

testLogin();
