// 测试登录API - 使用原始supabase客户端
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

async function testLogin() {
  console.log('Testing login with Supabase directly...');
  console.log('URL:', env.SUPABASE_URL);
  
  try {
    // 尝试登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@pnds.com',
      password: 'Yiyi0058'
    });
    
    if (error) {
      console.error('登录失败:', error.message);
      console.error('错误代码:', error.code);
      return;
    }
    
    if (data.user) {
      console.log('登录成功!');
      console.log('用户ID:', data.user.id);
      console.log('邮箱:', data.user.email);
    } else {
      console.log('登录失败: 没有返回用户数据');
    }
    
  } catch (err) {
    console.error('异常错误:', err.message);
    console.error('完整错误:', err);
  }
}

testLogin();
