'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '@/lib/supabase';

const { Title, Text } = Typography;

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  post_count?: number;
}

// Hàm tạo slug từ tiếng Việt
function generateSlug(text: string): string {
  const vietnameseMap: Record<string, string> = {
    à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
    ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
    â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
    đ: 'd',
    è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
    ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e',
    ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
    ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
    ô: 'o', ố: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
    ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
    ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
    ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u',
    ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
  };

  return text
    .toLowerCase()
    .split('')
    .map((char) => vietnameseMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form] = Form.useForm();

  // ─── Load categories ───
  const loadCategories = useCallback(async () => {
    setLoading(true);
    // Lấy categories + đếm số bài viết
    const { data, error } = await supabase
      .from('categories')
      .select('*, posts(count)')
      .order('created_at', { ascending: false });

    if (error) {
      message.error('Lỗi tải danh mục: ' + error.message);
    } else {
      const mapped = (data || []).map((cat: any) => ({
        ...cat,
        post_count: cat.posts?.[0]?.count ?? 0,
      }));
      setCategories(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ─── Filter theo search ───
  const filtered = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Mở modal tạo mới ───
  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  // ─── Mở modal chỉnh sửa ───
  const handleEdit = (record: Category) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description || '',
    });
    setModalOpen(true);
  };

  // ─── Xóa category ───
  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      message.error('Lỗi xóa: ' + error.message);
    } else {
      message.success('Đã xóa danh mục');
      await loadCategories();
    }
    setActionLoading(null);
  };

  // ─── Submit form (tạo / sửa) ───
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editing) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update({
            name: values.name,
            slug: values.slug,
            description: values.description || null,
          })
          .eq('id', editing.id);

        if (error) throw error;
        message.success('Đã cập nhật danh mục');
      } else {
        // Create
        const { error } = await supabase.from('categories').insert({
          name: values.name,
          slug: values.slug,
          description: values.description || null,
        });

        if (error) throw error;
        message.success('Đã tạo danh mục mới');
      }

      setModalOpen(false);
      form.resetFields();
      loadCategories();
    } catch (err: any) {
      if (err?.message) {
        // Duplicate slug
        if (err.message.includes('duplicate') || err.message.includes('unique')) {
          message.error('Slug đã tồn tại, vui lòng chọn slug khác');
        } else {
          message.error('Lỗi: ' + err.message);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  // ─── Auto-generate slug khi nhập name ───
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Chỉ auto-generate khi tạo mới hoặc user chưa sửa slug thủ công
    if (!editing) {
      form.setFieldsValue({ slug: generateSlug(name) });
    }
  };

  // ─── Table columns ───
  const columns: ColumnsType<Category> = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <Tag>{slug}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string | null) => desc || <Text type="secondary">—</Text>,
    },
    {
      title: 'Bài viết',
      dataIndex: 'post_count',
      key: 'post_count',
      width: 100,
      align: 'center',
      render: (count: number) => count,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={actionLoading === record.id}
          />
          <Popconfirm
            title="Xóa danh mục?"
            description={
              record.post_count
                ? `Danh mục này có ${record.post_count} bài viết. Bài viết sẽ mất category.`
                : 'Bạn chắc chắn muốn xóa?'
            }
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
          Danh mục
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm danh mục
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm danh mục..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 16, maxWidth: 360 }}
      />

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} danh mục`,
        }}
        locale={{ emptyText: 'Chưa có danh mục nào' }}
      />

      {/* ─── Modal Tạo / Sửa ─── */}
      <Modal
        title={editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText={editing ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
        confirmLoading={saving}
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input
              placeholder="VD: Sách Tâm Lý"
              onChange={handleNameChange}
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: 'Vui lòng nhập slug' },
              {
                pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
                message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang',
              },
            ]}
          >
            <Input placeholder="vd: sach-tam-ly" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về danh mục (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
