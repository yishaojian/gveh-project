// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL || '';
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper functions for common operations
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function createUserProfile(userId: string, email: string, role: 'admin' | 'sales' | 'customer' = 'customer') {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      role,
      performance_total: 0
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveBOMSubmission(submission: {
  customer_email: string;
  bom_text?: string;
  file_url?: string;
  assigned_sales_id?: string;
  region?: string;
}) {
  const { data, error } = await supabase
    .from('bom_submissions')
    .insert({
      customer_email: submission.customer_email,
      bom_text: submission.bom_text,
      file_url: submission.file_url,
      assigned_sales_id: submission.assigned_sales_id,
      status: 'pending',
      region: submission.region
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBOMStatus(bomId: string, status: 'pending' | 'quoted' | 'ordered' | 'completed' | 'cancelled') {
  const { data, error } = await supabase
    .from('bom_submissions')
    .update({ status })
    .eq('id', bomId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getBOMSubmissionsBySales(salesId: string) {
  const { data, error } = await supabase
    .from('bom_submissions')
    .select('*')
    .eq('assigned_sales_id', salesId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllBOMSubmissions() {
  const { data, error } = await supabase
    .from('bom_submissions')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSalesTeam() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'sales');
  if (error) throw error;
  return data;
}

export async function updateSalesPerformance(salesId: string, amount: number) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      performance_total: supabase.raw(`performance_total + ${amount}`)
    })
    .eq('id', salesId)
    .select()
    .single();
  if (error) throw error;
  return data;
}