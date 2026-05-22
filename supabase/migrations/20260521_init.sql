-- supabase/migrations/20260521_init.sql
-- PNDS BOM Hub 数据库初始化脚本
-- 在 Supabase 控制台 SQL Editor 中执行此脚本

-- 创建 profiles 表（员工与业绩表）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales', 'customer')) DEFAULT 'customer',
  wechat_key TEXT,
  name TEXT,
  phone TEXT,
  performance_total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 bom_submissions 表（BOM 订单分配表）
CREATE TABLE IF NOT EXISTS bom_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  bom_text TEXT,
  file_url TEXT,
  assigned_sales_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'ordered', 'completed', 'cancelled')),
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_bom_submissions_status ON bom_submissions(status);
CREATE INDEX IF NOT EXISTS idx_bom_submissions_sales ON bom_submissions(assigned_sales_id);
CREATE INDEX IF NOT EXISTS idx_bom_submissions_region ON bom_submissions(region);
CREATE INDEX IF NOT EXISTS idx_bom_submissions_customer ON bom_submissions(customer_email);

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_update ON profiles;
CREATE TRIGGER trigger_profiles_update
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_bom_submissions_update ON bom_submissions;
CREATE TRIGGER trigger_bom_submissions_update
BEFORE UPDATE ON bom_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 插入默认销售团队数据
INSERT INTO profiles (id, email, role, name, wechat_key, performance_total) VALUES
('sales-cn-001', 'sales-cn@pnds.com', 'sales', '张伟', NULL, 1560000),
('sales-global-001', 'sales-global@pnds.com', 'sales', '李明', NULL, 2340000),
('sales-eu-001', 'sales-eu@pnds.com', 'sales', '王芳', NULL, 1890000)
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  performance_total = EXCLUDED.performance_total;

-- 插入默认管理员数据
INSERT INTO profiles (id, email, role, name, performance_total) VALUES
('admin-001', 'admin@pnds.com', 'admin', '系统管理员', 0)
ON CONFLICT (email) DO NOTHING;

-- 创建行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_submissions ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有数据
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (role = 'admin');

CREATE POLICY "Admin can view all submissions" ON bom_submissions
  FOR SELECT USING (true);

CREATE POLICY "Admin can update all submissions" ON bom_submissions
  FOR UPDATE USING (true);

-- 销售人员可以查看自己的数据和分配给自己的订单
CREATE POLICY "Sales can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Sales can view assigned submissions" ON bom_submissions
  FOR SELECT USING (assigned_sales_id = auth.uid());

CREATE POLICY "Sales can update assigned submissions" ON bom_submissions
  FOR UPDATE USING (assigned_sales_id = auth.uid());

-- 客户可以查看自己的订单
CREATE POLICY "Customer can view own submissions" ON bom_submissions
  FOR SELECT USING (customer_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- 允许匿名用户插入新的 BOM 提交（免注册询价）
CREATE POLICY "Anonymous can insert submissions" ON bom_submissions
  FOR INSERT WITH CHECK (true);

-- 输出执行结果
SELECT '✅ Profiles table created with ' || (SELECT COUNT(*) FROM profiles) || ' records' AS result;
SELECT '✅ BOM Submissions table created with ' || (SELECT COUNT(*) FROM bom_submissions) || ' records' AS result;