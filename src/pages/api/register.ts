// src/pages/api/register.ts - 模拟注册（本地模式）
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
    password: '123456'
  },
  {
    id: 'customer-001',
    email: 'test@pnds.com',
    name: '测试用户',
    role: 'customer',
    password: '123456'
  }
];

export async function POST({ request }: APIContext) {
  try {
    const { identifier, password, name, phone } = await request.json();
    
    // 检测是邮箱还是手机号
    let email: string;
    if (identifier.includes('@')) {
      email = identifier;
    } else {
      email = `user_${identifier}@pnds.com`;
    }
    
    // 检查邮箱是否已存在
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        message: '该邮箱已被注册'
      }), { status: 200 });
    }
    
    // 创建新用户
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name: name || '用户',
      role: 'customer',
      password,
      phone
    };
    
    mockUsers.push(newUser);
    
    return new Response(JSON.stringify({
      success: true,
      message: '注册成功，请登录',
      profile: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }), { status: 200 });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '注册过程中发生错误'
    }), { status: 500 });
  }
}
