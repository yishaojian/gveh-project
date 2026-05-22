// 创建管理员账号脚本
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

// 加载环境变量
const env = loadEnv('development', process.cwd(), '');

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

async function createAdminAccount() {
  const email = 'admin@pnds.com';
  const password = 'Yiyi0058';
  const name = '管理员';

  try {
    // 1. 注册用户（默认角色是 customer）
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (signUpError) {
      console.error('注册失败:', signUpError.message);
      return;
    }

    const userId = signUpData.user.id;
    console.log('用户注册成功，用户ID:', userId);

    // 2. 更新角色为 admin
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('更新角色失败:', updateError.message);
      return;
    }

    console.log('管理员账号创建成功！');
    console.log('----------------------');
    console.log('邮箱:', email);
    console.log('密码:', password);
    console.log('角色:', updateData.role);
    console.log('----------------------');

  } catch (error) {
    console.error('创建管理员账号时发生错误:', error.message);
  }
}

createAdminAccount();
