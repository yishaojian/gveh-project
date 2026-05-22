// src/pages/api/login.ts - 模拟登录（本地模式）
import type { APIContext } from 'astro';

// 模拟用户数据库
const mockUsers = [
  {
    id: 'admin-001',
    email: 'admin@pnds.com',
    name: '管理员',
    role: 'admin',
    password: 'Yiyi0058'
  },
  {
    id: 'sales-cn-001',
    email: 'sales-cn@pnds.com',
    name: '张伟',
    role: 'sales',
    password: 'Yiyi0058'
  },
  {
    id: 'sales-us-001',
    email: 'sales-us@pnds.com',
    name: 'Mike',
    role: 'sales',
    password: 'Yiyi0058'
  },
  {
    id: 'customer-001',
    email: 'test@pnds.com',
    name: '测试用户',
    role: 'customer',
    password: 'Yiyi0058'
  },
  {
    id: 'customer-002',
    email: 'client@pnds.com',
    name: '客户A',
    role: 'customer',
    password: 'Yiyi0058'
  }
];

export async function POST({ request }: APIContext) {
  try {
    const { identifier, password } = await request.json();
    
    // 查找用户（支持邮箱、用户名）
    const user = mockUsers.find(u => 
      u.email === identifier || u.name === identifier
    );
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: '用户不存在'
      }), { status: 200 });
    }
    
    if (user.password !== password) {
      return new Response(JSON.stringify({
        success: false,
        message: '密码错误'
      }), { status: 200 });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: '登录成功',
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }), { status: 200 });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '登录过程中发生错误'
    }), { status: 500 });
  }
}
