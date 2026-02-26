'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  message,
  Typography,
  Divider,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { supabase } from '@/lib/supabase';
import RichEditor from './RichEditor';

const { Title } = Typography;

interface PostFormProps {
  postId?: string; // undefined = tạo mới, có giá trị = chỉnh sửa
}

interface CategoryOption {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
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

export default function PostForm({ postId }: PostFormProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [content, setContent] = useState('');
  const isEditing = !!postId;

  // ─── Load categories & tags ───
  useEffect(() => {
    async function loadOptions() {
      const [catRes, tagRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('tags').select('id, name').order('name'),
      ]);
      setCategories(catRes.data || []);
      setTags(tagRes.data || []);
    }
    loadOptions();
  }, []);

  // ─── Load post data khi edit ───
  useEffect(() => {
    if (!postId) return;

    async function loadPost() {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*, post_tags(tag_id)')
        .eq('id', postId)
        .single();

      if (error || !data) {
        message.error('Không tìm thấy bài viết');
        router.push('/posts');
        return;
      }

      form.setFieldsValue({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        cover_image: data.cover_image || '',
        category_id: data.category_id || undefined,
        tag_ids: data.post_tags?.map((pt: any) => pt.tag_id) || [],
        author_name: data.author_name || '',
      });
      setContent(data.content || '');
      setLoading(false);
    }
    loadPost();
  }, [postId, form, router]);

  // ─── Auto-generate slug ───
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) {
      form.setFieldsValue({ slug: generateSlug(e.target.value) });
    }
  };

  // ─── Save post ───
  const handleSave = async (status: 'draft' | 'published') => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const postData = {
        title: values.title,
        slug: values.slug,
        content,
        excerpt: values.excerpt || null,
        cover_image: values.cover_image || null,
        category_id: values.category_id || null,
        author_name: values.author_name || null,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
      };

      let savedPostId = postId;

      if (isEditing) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert(postData)
          .select('id')
          .single();
        if (error) throw error;
        savedPostId = data.id;
      }

      // ─── Cập nhật tags (xóa cũ, thêm mới) ───
      if (savedPostId) {
        await supabase.from('post_tags').delete().eq('post_id', savedPostId);

        const tagIds: string[] = values.tag_ids || [];
        if (tagIds.length > 0) {
          const postTags = tagIds.map((tag_id: string) => ({
            post_id: savedPostId!,
            tag_id,
          }));
          const { error: tagError } = await supabase
            .from('post_tags')
            .insert(postTags);
          if (tagError) throw tagError;
        }
      }

      message.success(
        isEditing ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết mới'
      );
      router.push('/posts');
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

  return (
    <>
      {/* ─── Header ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/posts')}
          >
            Quay lại
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </Title>
        </Space>

        <Space>
          <Button
            icon={<SaveOutlined />}
            onClick={() => handleSave('draft')}
            loading={saving}
          >
            Lưu nháp
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSave('published')}
            loading={saving}
          >
            Xuất bản
          </Button>
        </Space>
      </div>

      {/* ─── Form ─── */}
      <Form form={form} layout="vertical" disabled={loading}>
        <Row gutter={24}>
          {/* Cột trái — Nội dung chính */}
          <Col xs={24} lg={16}>
            <Card>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input
                  placeholder="Tiêu đề bài viết"
                  size="large"
                  onChange={handleTitleChange}
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
                <Input placeholder="url-bai-viet" />
              </Form.Item>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Nội dung
                </label>
                <RichEditor value={content} onChange={setContent} />
              </div>

              <Form.Item name="excerpt" label="Tóm tắt">
                <Input.TextArea
                  rows={3}
                  placeholder="Mô tả ngắn hiển thị ở trang chủ (không bắt buộc)"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Cột phải — Metadata */}
          <Col xs={24} lg={8}>
            <Card title="Phân loại" style={{ marginBottom: 16 }}>
              <Form.Item name="category_id" label="Danh mục">
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </Form.Item>

              <Form.Item name="tag_ids" label="Tags">
                <Select
                  mode="multiple"
                  placeholder="Chọn tags"
                  allowClear
                  options={tags.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                />
              </Form.Item>
            </Card>

            <Card title="Thông tin thêm">
              <Form.Item name="author_name" label="Tác giả">
                <Input placeholder="Tên tác giả" />
              </Form.Item>

              <Form.Item name="cover_image" label="Ảnh bìa (URL)">
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}
