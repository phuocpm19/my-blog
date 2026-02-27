'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Post, TradingReport } from 'shared';

import {
  Modal,
  Input,
  List,
  Tag,
  Typography,
  Empty,
  Spin,
  Space,
  theme,
} from 'antd';
import {
  SearchOutlined,
  ReadOutlined,
  LineChartOutlined,
  CalendarOutlined,
  EnterOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface SearchResult {
  id: string;
  type: 'post' | 'report';
  title: string;
  description: string;
  url: string;
  date: string | null;
  extra?: string; // category name or session
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const { token } = theme.useToken();
  const router = useRouter();
  const inputRef = useRef<any>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!open) {
          // Parent handles opening, but we can't do that from here
          // This is handled in Navbar
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const searchTerm = `%${q.trim()}%`;

    const [postsRes, reportsRes] = await Promise.all([
      supabase
        .from('posts')
        .select('id, title, excerpt, slug, published_at, category:categories(name)')
        .eq('status', 'published')
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
        .order('published_at', { ascending: false })
        .limit(5),
      supabase
        .from('trading_reports')
        .select('id, title, content, session, report_date')
        .eq('status', 'published')
        .ilike('title', searchTerm)
        .order('report_date', { ascending: false })
        .limit(5),
    ]);

    const mapped: SearchResult[] = [];

    if (postsRes.data) {
      postsRes.data.forEach((post: any) => {
        mapped.push({
          id: post.id,
          type: 'post',
          title: post.title,
          description: post.excerpt || '',
          url: `/posts/${post.slug}`,
          date: post.published_at,
          extra: post.category?.name,
        });
      });
    }

    if (reportsRes.data) {
      reportsRes.data.forEach((report: any) => {
        mapped.push({
          id: report.id,
          type: 'report',
          title: report.title,
          description: report.content?.replace(/<[^>]*>/g, '').slice(0, 100) || '',
          url: `/trading-reports/${report.id}`,
          date: report.report_date,
          extra: report.session,
        });
      });
    }

    setResults(mapped);
    setActiveIndex(0);
    setLoading(false);
  }, []);

  // Handle input change with debounce
  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      navigateTo(results[activeIndex].url);
    }
  };

  const navigateTo = (url: string) => {
    onClose();
    router.push(url);
  };

  const sessionColors: Record<string, string> = {
    SS1: 'blue', SS2: 'cyan', SS3: 'green',
    SS4: 'orange', SS5: 'volcano', SS6: 'purple',
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={600}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 12, overflow: 'hidden' },
      }}
      style={{ top: 80 }}
    >
      {/* Search Input */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Input
          ref={inputRef}
          placeholder="Tìm kiếm bài viết, trading reports..."
          prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
          suffix={
            <Text
              type="secondary"
              style={{
                fontSize: 11,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                padding: '1px 6px',
              }}
            >
              ESC
            </Text>
          }
          variant="borderless"
          size="large"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ fontSize: 16 }}
        />
      </div>

      {/* Results */}
      <div
        style={{
          maxHeight: 400,
          overflowY: 'auto',
          padding: query.trim() ? '8px 0' : 0,
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Spin size="small" />
          </div>
        ) : query.trim() && results.length === 0 ? (
          <Empty
            description="Không tìm thấy kết quả"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '24px 0' }}
          />
        ) : (
          results.map((item, index) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => navigateTo(item.url)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: index === activeIndex ? token.colorBgTextHover : 'transparent',
                borderLeft: index === activeIndex ? `3px solid ${token.colorPrimary}` : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <Space align="start" style={{ width: '100%' }}>
                {item.type === 'post' ? (
                  <ReadOutlined style={{ fontSize: 16, color: token.colorPrimary, marginTop: 3 }} />
                ) : (
                  <LineChartOutlined style={{ fontSize: 16, color: '#52c41a', marginTop: 3 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text strong ellipsis style={{ flex: 1 }}>
                      {item.title}
                    </Text>
                    {index === activeIndex && (
                      <EnterOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
                    )}
                  </div>
                  <Space size={4} style={{ marginBottom: 2 }}>
                    {item.type === 'report' && item.extra && (
                      <Tag
                        color={sessionColors[item.extra] || 'default'}
                        style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}
                      >
                        {item.extra}
                      </Tag>
                    )}
                    {item.type === 'post' && item.extra && (
                      <Tag
                        color="blue"
                        style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}
                      >
                        {item.extra}
                      </Tag>
                    )}
                    {item.date && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined /> {new Date(item.date).toLocaleDateString('vi-VN')}
                      </Text>
                    )}
                  </Space>
                  {item.description && (
                    <Text
                      type="secondary"
                      ellipsis
                      style={{ fontSize: 13, display: 'block' }}
                    >
                      {item.description}
                    </Text>
                  )}
                </div>
              </Space>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      {query.trim() && results.length > 0 && (
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            <Text keyboard style={{ fontSize: 11 }}>↑↓</Text> di chuyển
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <Text keyboard style={{ fontSize: 11 }}>Enter</Text> mở
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <Text keyboard style={{ fontSize: 11 }}>ESC</Text> đóng
          </Text>
        </div>
      )}
    </Modal>
  );
}
