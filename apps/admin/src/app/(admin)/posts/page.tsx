'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Table,
  Button,
  Space,
  Input,
  Tag,
  message,
  Popconfirm,
  Select,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '@/lib/supabase';

const { Title, Text } = Typography;

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: 'draft' | 'published';
  category: { name: string } | null;
  author_name: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // track id đang xử lý

  // ─── Load posts ───
  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, status, author_name, published_at, created_at, updated_at, category:categories(name)')
      .order('created_at', { ascending: false });

    if (error) {
      message.error('Lỗi tải bài viết: ' + error.message);
    } else {
      // Supabase trả category dạng array, cần map về object
      const mapped = (data || []).map((post: any) => ({
        ...post,
        category: Array.isArray(post.category) ? post.category[0] ?? null : post.category,
      }));
      setPosts(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ─── Filter ───
  const filtered = posts.filter((post) => {
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || post.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ─── Xóa post ───
  const handleDelete = async (id: string) => {
    setActionLoading(id);
    await supabase.from('post_tags').delete().eq('post_id', id);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      message.error('Lỗi xóa: ' + error.message);
    } else {
      message.success('Đã xóa bài viết');
      await loadPosts();
    }
    setActionLoading(null);
  };

  // ─── Toggle status ───
  const handleToggleStatus = async (post: Post) => {
    setActionLoading(post.id);
    const newStatus = post.status === 'draft' ? 'published' : 'draft';
    const { error } = await supabase
      .from('posts')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', post.id);

    if (error) {
      message.error('Lỗi: ' + error.message);
    } else {
      message.success(
        newStatus === 'published' ? 'Đã xuất bản' : 'Đã chuyển về nháp'
      );
      await loadPosts();
    }
    setActionLoading(null);
  };

  // ─── Table columns ───
  const columns: ColumnsType<Post> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Post) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            /{record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      key: 'category',
      width: 150,
      render: (_: any, record: Post) =>
        record.category ? (
          <Tag>{record.category.name}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string, record: Post) =>
        actionLoading === record.id ? (
          <Spin size="small" />
        ) : (
          <Tag
            color={status === 'published' ? 'green' : 'default'}
            style={{ cursor: 'pointer' }}
            onClick={() => handleToggleStatus(record)}
          >
            {status === 'published' ? 'Đã xuất bản' : 'Nháp'}
          </Tag>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_: any, record: Post) => (
        <Space>
          {record.status === 'published' && (
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => window.open(`/${record.slug}`, '_blank')}
              disabled={actionLoading === record.id}
            />
          )}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push(`/posts/${record.id}/edit`)}
            disabled={actionLoading === record.id}
          />
          <Popconfirm
            title="Xóa bài viết?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={actionLoading === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Bài viết
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/posts/new')}
        >
          Viết bài mới
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm bài viết..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 140 }}
          options={[
            { value: 'draft', label: 'Nháp' },
            { value: 'published', label: 'Đã xuất bản' },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} bài viết`,
        }}
        locale={{ emptyText: 'Chưa có bài viết nào' }}
      />
    </>
  );
}
