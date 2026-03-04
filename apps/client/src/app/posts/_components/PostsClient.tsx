'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  TagOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const categoryColors = [
  'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'gold', 'lime',
];

const PAGE_SIZE = 9;

export default function PostsPageClient() {
  const { token } = theme.useToken();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc tag filter từ URL ?tag=slug
  const tagSlugFromUrl = searchParams.get('tag') ?? undefined;

  const [posts, setPosts] = useState<(Post & { category: { name: string; slug: string } | null })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState<string | undefined>(tagSlugFromUrl);
  const [tagLabel, setTagLabel] = useState<string | undefined>(undefined);

  // Fetch categories once
  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  // Khi URL thay đổi (từ click tag), sync vào state
  useEffect(() => {
    setTagFilter(tagSlugFromUrl);
    setPage(1);

    // Lấy tên tag để hiển thị badge
    if (tagSlugFromUrl) {
      supabase
        .from('tags')
        .select('name')
        .eq('slug', tagSlugFromUrl)
        .single()
        .then(({ data }) => {
          if (data) setTagLabel(data.name);
        });
    } else {
      setTagLabel(undefined);
    }
  }, [tagSlugFromUrl]);

  // Fetch posts with filters
  const fetchPosts = useCallback(async () => {
    setLoading(true);

    // Nếu có tag filter: lấy post_ids qua bảng post_tags trước
    if (tagFilter) {
      // 1. Lấy tag_id từ slug
      const { data: tagData } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tagFilter)
        .single();

      if (!tagData) {
        setPosts([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      // 2. Lấy post_ids có tag này
      const { data: postTags } = await supabase
        .from('post_tags')
        .select('post_id')
        .eq('tag_id', tagData.id);

      const postIds = postTags?.map((pt: any) => pt.post_id) ?? [];

      if (postIds.length === 0) {
        setPosts([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      // 3. Fetch posts với những id đó
      let query = supabase
        .from('posts')
        .select('*, category:categories(name, slug)', { count: 'exact' })
        .eq('status', 'published')
        .in('id', postIds)
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
      return;
    }

    // Không có tag filter — query bình thường
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
  }, [page, search, categoryFilter, tagFilter]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string | undefined) => {
    setCategoryFilter(value || undefined);
    setPage(1);
  };

  const clearTagFilter = () => {
    router.push('/posts');
  };

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
        <Text type="secondary">Tổng cộng {total} bài viết</Text>
      </div>

      {/* Filters */}
      <Space wrap size="middle" style={{ marginBottom: 16, width: '100%' }}>
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
          options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        />
      </Space>

      {/* Tag filter badge — hiện khi đang filter theo tag */}
      {tagLabel && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text type="secondary">Đang lọc theo tag:</Text>
            <Tag
              icon={<TagOutlined />}
              color="blue"
              closeIcon={<CloseCircleOutlined />}
              onClose={clearTagFilter}
              style={{ fontSize: 13, padding: '2px 8px' }}
            >
              {tagLabel}
            </Tag>
          </Space>
        </div>
      )}

      {/* Posts Grid */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card><Skeleton active paragraph={{ rows: 3 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : posts.length === 0 ? (
        <Empty
          description={
            search || categoryFilter || tagFilter
              ? 'Không tìm thấy bài viết nào'
              : 'Chưa có bài viết nào'
          }
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
                    <Title level={5} style={{ marginTop: 0 }}>{post.title}</Title>
                    {post.author_name && (
                      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                        Tác giả: {post.author_name}
                      </Text>
                    )}
                    <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ marginBottom: 8 }}>
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