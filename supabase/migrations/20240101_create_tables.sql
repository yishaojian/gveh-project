-- supabase/migrations/20240101_create_tables.sql
-- 运行方式：在 Supabase 控制台的 SQL 编辑器中执行

-- 创建 profiles 表（用户与员工表）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales', 'customer')),
  wechat_key TEXT,
  name TEXT,
  performance_total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 bom_submissions 表（BOM 订单表）
CREATE TABLE bom_submissions (
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

-- 创建索引
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_bom_submissions_status ON bom_submissions(status);
CREATE INDEX idx_bom_submissions_sales ON bom_submissions(assigned_sales_id);
CREATE INDEX idx_bom_submissions_region ON bom_submissions(region);

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_update
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_bom_submissions_update
BEFORE UPDATE ON bom_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 插入初始管理员数据（请替换为你的邮箱）
INSERT INTO profiles (id, email, role, name, performance_total)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'admin@pnds.com'),
  'admin@pnds.com',
  'admin',
  '系统管理员',
  0
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@pnds.com');

-- 插入初始销售团队数据
INSERT INTO profiles (email, role, name, wechat_key, performance_total) VALUES
('sales-cn@pnds.com', 'sales', '张伟', NULL, 1560000),
('sales-global@pnds.com', 'sales', '李明', NULL, 2340000),
('sales-eu@pnds.com', 'sales', '王芳', NULL, 1890000)
ON CONFLICT (email) DO NOTHING;

-- 创建行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_submissions ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有数据
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (role = 'admin');

CREATE POLICY "Admin can view all submissions" ON bom_submissions
  FOR SELECT USING (true);

-- 销售人员可以查看自己的数据和分配给自己的订单
CREATE POLICY "Sales can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Sales can view assigned submissions" ON bom_submissions
  FOR SELECT USING (assigned_sales_id = auth.uid());

-- 客户可以查看自己的订单
CREATE POLICY "Customer can view own submissions" ON bom_submissions
  FOR SELECT USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));