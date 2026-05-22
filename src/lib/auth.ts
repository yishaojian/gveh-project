// src/lib/auth.ts
import { supabase } from './supabase';
import type { Profile } from '../database.types';

// 登录类型
export type LoginResult = {
  success: boolean;
  message: string;
  profile?: Profile;
};

// 登录（邮箱+密码）
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: '登录失败，请检查邮箱和密码' };
    }

    // 获取用户资料
    const profile = await fetchProfile(data.user.id);
    return { success: true, message: '登录成功', profile };
  } catch (error) {
    return { success: false, message: '登录过程中发生错误' };
  }
}

// 注册
export async function register(email: string, password: string, name?: string): Promise<LoginResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: '注册失败' };
    }

    // 创建用户资料
    await createProfile(data.user.id, email, 'customer', name);
    
    const profile = await fetchProfile(data.user.id);
    return { success: true, message: '注册成功', profile };
  } catch (error) {
    return { success: false, message: '注册过程中发生错误' };
  }
}

// 登出
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// 获取当前用户
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// 获取当前用户资料
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return fetchProfile(user.id);
}

// 获取指定用户资料
export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    // 如果没有资料，创建一个
    if (error.code === 'PGRST116') {
      return createProfile(userId, 'unknown@example.com', 'customer');
    }
    throw error;
  }
  
  return data;
}

// 创建用户资料
export async function createProfile(userId: string, email: string, role: 'admin' | 'sales' | 'customer', name?: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      role,
      name,
      performance_total: 0
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 检查是否已登录
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// 检查角色权限
export async function requireRole(role: 'admin' | 'sales' | 'customer'): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  
  // admin 可以访问所有页面
  if (role === 'admin') {
    return profile.role === 'admin';
  }
  
  // sales 可以访问 sales 和 customer 页面
  if (role === 'sales') {
    return profile.role === 'admin' || profile.role === 'sales';
  }
  
  // customer 可以访问 customer 页面
  return true;
}

// 更新用户资料
export async function updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 从 cookies 获取用户会话信息
export async function getUserFromSession(cookies: any): Promise<Profile | null> {
  try {
    const userData = cookies.get('user_session')?.value;
    if (!userData) {
      return null;
    }
    
    try {
      const parsed = JSON.parse(userData);
      return parsed;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}