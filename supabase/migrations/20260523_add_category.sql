-- Add category column to blogs table
ALTER TABLE blogs
ADD COLUMN category TEXT NOT NULL DEFAULT 'domestic_vs_global' 
CHECK (category IN ('domestic_vs_global', 'about_us', 'bom_optimization'));

-- Add index for category queries
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
