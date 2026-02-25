// ============================================
// Database Types — map 1:1 với Supabase tables
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  category_id: string;
  author_name: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (optional, khi join)
  category?: Category;
  tags?: Tag[];
}

export interface TradingReport {
  id: string;
  title: string;
  content: string;
  session: string;
  report_date: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  // Relations
  trades?: Trade[];
}

export type TradeSide = 'long' | 'short';

export interface Trade {
  id: string;
  pair: string;
  side: TradeSide;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  pnl_percent: number;
  fee: number;
  leverage: number;
  strategy: string | null;
  notes: string | null;
  trade_date: string;
  report_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Common Types
// ============================================

export type PostStatus = 'draft' | 'published';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}