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
  Tag as AntTag,
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

interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
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

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // ─── Load tags ───
  const loadTags = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tags')
      .select('*, post_tags(count)')
      .order('created_at', { ascending: false });

    if (error) {
      message.error('Lỗi tải tags: ' + error.message);
    } else {
      const mapped = (data || []).map((tag: any) => ({
        ...tag,
        post_count: tag.post_tags?.[0]?.count ?? 0,
      }));
      setTags(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // ─── Filter theo search ───
  const filtered = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) ||
      tag.slug.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Mở modal tạo mới ───
  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  // ─── Mở modal chỉnh sửa ───
  const handleEdit = (record: Tag) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
    });
    setModalOpen(true);
  };

  // ─── Xóa tag ───
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) {
      message.error('Lỗi xóa: ' + error.message);
    } else {
      message.success('Đã xóa tag');
      loadTags();
    }
  };

  // ─── Submit form (tạo / sửa) ───
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editing) {
        const { error } = await supabase
          .from('tags')
          .update({ name: values.name, slug: values.slug })
          .eq('id', editing.id);
        if (error) throw error;
        message.success('Đã cập nhật tag');
      } else {
        const { error } = await supabase
          .from('tags')
          .insert({ name: values.name, slug: values.slug });
        if (error) throw error;
        message.success('Đã tạo tag mới');
      }

      setModalOpen(false);
      form.resetFields();
      loadTags();
    } catch (err: any) {
      if (err?.message) {
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

  // ─── Auto-generate slug ───
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) {
      form.setFieldsValue({ slug: generateSlug(e.target.value) });
    }
  };

  // ─── Table columns ───
  const columns: ColumnsType<Tag> = [
    {
      title: 'Tên tag',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <AntTag color="blue">{slug}</AntTag>,
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
      render: (_: any, record: Tag) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa tag?"
            description={
              record.post_count
                ? `Tag này đang gắn với ${record.post_count} bài viết.`
                : 'Bạn chắc chắn muốn xóa?'
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
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
          Tags
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm tag
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm tag..."
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
          showTotal: (total) => `Tổng ${total} tags`,
        }}
        locale={{ emptyText: 'Chưa có tag nào' }}
      />

      {/* ─── Modal Tạo / Sửa ─── */}
      <Modal
        title={editing ? 'Chỉnh sửa tag' : 'Thêm tag mới'}
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
            label="Tên tag"
            rules={[{ required: true, message: 'Vui lòng nhập tên tag' }]}
          >
            <Input
              placeholder="VD: psychology"
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
            <Input placeholder="vd: psychology" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
