-- ============================================
-- MY BLOG — Database Setup
-- Chạy trong Supabase SQL Editor
-- ============================================

-- 1. Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tags
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Post Tags (many-to-many)
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 5. Trading Reports
CREATE TABLE trading_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  session TEXT,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Trades
CREATE TABLE trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('long', 'short')),
  entry_price DECIMAL NOT NULL,
  exit_price DECIMAL,
  quantity DECIMAL NOT NULL,
  pnl DECIMAL DEFAULT 0,
  pnl_percent DECIMAL DEFAULT 0,
  fee DECIMAL DEFAULT 0,
  leverage INTEGER DEFAULT 1,
  strategy TEXT,
  notes TEXT,
  trade_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_id UUID REFERENCES trading_reports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trading_reports_updated_at
  BEFORE UPDATE ON trading_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Bật RLS cho tất cả bảng
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: Ai cũng đọc được (cho client app)
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Public read published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read post_tags" ON post_tags
  FOR SELECT USING (true);

CREATE POLICY "Public read published reports" ON trading_reports
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read trades" ON trades
  FOR SELECT USING (true);

-- ADMIN WRITE: Chỉ user đã đăng nhập mới được tạo/sửa/xóa
CREATE POLICY "Admin insert categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update categories" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete categories" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert tags" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update tags" ON tags
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete tags" ON tags
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert post_tags" ON post_tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin delete post_tags" ON post_tags
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all trading_reports" ON trading_reports
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all trades" ON trades
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- Sample Data (demo)
-- ============================================

INSERT INTO categories (name, slug, description) VALUES
  ('Trading', 'trading', 'Kiến thức và chiến lược giao dịch'),
  ('Sách Kỹ Năng', 'sach-ky-nang', 'Review sách phát triển bản thân, kỹ năng sống'),
  ('Sách Tâm Lý', 'sach-tam-ly', 'Review sách tâm lý học, hành vi con người'),
  ('Kiến Thức', 'kien-thuc', 'Chia sẻ kiến thức tổng hợp');

INSERT INTO tags (name, slug) VALUES
  ('crypto', 'crypto'),
  ('bitcoin', 'bitcoin'),
  ('self-help', 'self-help'),
  ('psychology', 'psychology'),
  ('review', 'review'),
  ('strategy', 'strategy');
