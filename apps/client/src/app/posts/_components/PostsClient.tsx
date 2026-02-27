'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Post, Category } from 'shared';

import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Input,
  Select,
  Space,
  Pagination,
  Skeleton,
  Empty,
  theme,
} from 'antd';
import {
  CalendarOutlined,
  SearchOutlined,
  ReadOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const categoryColors = [
  'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'gold', 'lime',
];

const PAGE_SIZE = 9;

export default function PostsPageClient() {
  const { token } = theme.useToken();
  const [posts, setPosts] = useState<(Post & { category: { name: string; slug: string } | null })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Fetch categories once
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  // Fetch posts with filters
  const fetchPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('posts')
      .select('*, category:categories(name, slug)', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,excerpt.ilike.%${search.trim()}%`);
    }

    if (categoryFilter) {
      query = query.eq('category_id', categoryFilter);
    }

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;

    if (data) setPosts(data);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset page when filters change
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string | undefined) => {
    setCategoryFilter(value || undefined);
    setPage(1);
  };

  // Map category id to color index
  const categoryColorMap: Record<string, number> = {};
  categories.forEach((cat, idx) => {
    categoryColorMap[cat.id] = idx;
  });

  return (
    <>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          <ReadOutlined /> Bài viết
        </Title>
        <Text type="secondary">
          Tổng cộng {total} bài viết
        </Text>
      </div>

      {/* Filters */}
      <Space wrap size="middle" style={{ marginBottom: 24, width: '100%' }}>
        <Input
          placeholder="Tìm kiếm bài viết..."
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          placeholder="Tất cả danh mục"
          allowClear
          onChange={handleCategoryChange}
          style={{ width: 200 }}
          options={categories.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }))}
        />
      </Space>

      {/* Posts Grid */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : posts.length === 0 ? (
        <Empty
          description={search || categoryFilter ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào'}
          style={{ padding: '48px 0' }}
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {posts.map((post) => (
              <Col xs={24} sm={12} md={8} key={post.id}>
                <Link href={`/posts/${post.slug}`} style={{ display: 'block', height: '100%' }}>
                  <Card hoverable style={{ height: '100%' }}>
                    {post.category && (
                      <Tag
                        color={categoryColors[(categoryColorMap[post.category_id] ?? 0) % categoryColors.length]}
                        style={{ marginBottom: 8 }}
                      >
                        {post.category.name}
                      </Tag>
                    )}
                    <Title level={5} style={{ marginTop: 0 }}>
                      {post.title}
                    </Title>
                    {post.author_name && (
                      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                        Tác giả: {post.author_name}
                      </Text>
                    )}
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 3 }}
                      style={{ marginBottom: 8 }}
                    >
                      {post.excerpt || 'Chưa có mô tả...'}
                    </Paragraph>
                    {post.published_at && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined />{' '}
                        {new Date(post.published_at).toLocaleDateString('vi-VN')}
                      </Text>
                    )}
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={setPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
