// apps/admin/src/app/(admin)/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  Tag, Space, Popconfirm, message, Typography, Card,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined,
} from '@ant-design/icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface UserRow {
  id: string;
  email: string;
  role: 'admin' | 'editor' | null;
  created_at: string;
  last_sign_in_at: string | null;
}

// Helper: lấy access token hiện tại để gửi lên API route
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? '';
}

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Chỉ admin được vào trang này
  useEffect(() => {
    if (!isAdmin) router.push('/');
  }, [isAdmin, router]);

  async function loadUsers() {
    setLoading(true);
    const token = await getToken();
    const res = await fetch('/api/admin/users', {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.users) setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleCreate(values: { email: string; password: string; role: string }) {
    setSubmitting(true);
    const token = await getToken();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (data.success) {
      message.success('Tạo tài khoản thành công');
      setCreateOpen(false);
      createForm.resetFields();
      loadUsers();
    } else {
      message.error(data.error ?? 'Có lỗi xảy ra');
    }
    setSubmitting(false);
  }

  async function handleUpdateRole(userId: string, role: string) {
    const token = await getToken();
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    if (data.success) {
      message.success('Cập nhật role thành công');
      setEditUser(null);
      loadUsers();
    } else {
      message.error(data.error ?? 'Có lỗi xảy ra');
    }
  }

  async function handleDelete(userId: string) {
    const token = await getToken();
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      message.success('Đã xóa tài khoản');
      loadUsers();
    } else {
      message.error(data.error ?? 'Có lỗi xảy ra');
    }
  }

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space><UserOutlined style={{ color: '#8c8c8c' }} />{email}</Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string | null) =>
        role === 'admin' ? <Tag color="red">Admin</Tag>
        : role === 'editor' ? <Tag color="blue">Biên tập viên</Tag>
        : <Tag color="default">Chưa có role</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Đăng nhập lần cuối',
      dataIndex: 'last_sign_in_at',
      key: 'last_sign_in_at',
      width: 180,
      render: (d: string | null) =>
        d ? new Date(d).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: UserRow) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditUser(record); editForm.setFieldsValue({ role: record.role }); }}
          />
          <Popconfirm
            title="Xóa tài khoản này?"
            description="Thao tác không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAdmin) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý Users</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Thêm tài khoản
        </Button>
      </div>

      <Card>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* Modal tạo user mới */}
      <Modal
        title="Tạo tài khoản mới"
        open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        footer={null}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="editor@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Nhập mật khẩu' },
              { min: 8, message: 'Tối thiểu 8 ký tự' },
            ]}
          >
            <Input.Password placeholder="Tối thiểu 8 ký tự" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Phân quyền"
            rules={[{ required: true, message: 'Chọn role' }]}
          >
            <Select placeholder="Chọn role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="editor">Biên tập viên</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setCreateOpen(false); createForm.resetFields(); }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>Tạo tài khoản</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa role */}
      <Modal
        title={`Chỉnh sửa role — ${editUser?.email}`}
        open={!!editUser}
        onCancel={() => setEditUser(null)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(v) => handleUpdateRole(editUser!.id, v.role)}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="role" label="Phân quyền" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="editor">Biên tập viên</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditUser(null)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}