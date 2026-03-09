'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Typography, Table, Button, Input, Select, Space, Tag, Modal,
  Form, Row, Col, Tooltip, message, Popconfirm, theme,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { supabase } from '@/lib/supabase';

const { Title } = Typography;
const { Option } = Select;

// ─── Constants ───
const PLATFORMS = ['Exness', 'FTMO'];

const ACCOUNT_TYPES: Record<string, string[]> = {
  Exness: ['Pro - USD', 'Pro - VND'],
  FTMO: [
    '10K - Step 1', '10K - Step 2', '10K - Live',
    '25K - Step 1', '25K - Step 2', '25K - Live',
    '50K - Step 1', '50K - Live',
    '100K - Step 1', '100K - Live',
    '200K - Step 1', '200K - Live',
  ],
};

const PLATFORM_COLOR: Record<string, string> = {
  Exness: 'green',
  FTMO: 'blue',
};

// ─── Types ───
interface TradingAccount {
  id: string;
  name: string;
  platform: string;
  account_name: string;
  account_type: string;
  created_at: string;
}

export default function TradingAccountsPage() {
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  // Form state để watch platform → update account_type options
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Exness');

  // ─── Fetch ───
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('trading_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (search.trim()) query = query.ilike('name', `%${search.trim()}%`);
    if (filterPlatform) query = query.eq('platform', filterPlatform);
    if (filterType) query = query.eq('account_type', filterType);

    const { data } = await query;
    setAccounts(data || []);
    setLoading(false);
  }, [search, filterPlatform, filterType]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // ─── Auto-generate name ───
  const updateName = () => {
    const platform = form.getFieldValue('platform');
    const accountName = form.getFieldValue('account_name');
    const accountType = form.getFieldValue('account_type');
    if (platform && accountType && accountName?.trim()) {
      form.setFieldValue('name', `${platform} ${accountType} ${accountName.trim()}`);
    } else {
      form.setFieldValue('name', '');
    }
  };

  // ─── Open modal ───
  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ platform: 'Exness' });
    setSelectedPlatform('Exness');
    setModalOpen(true);
  };

  const openEdit = (record: TradingAccount) => {
    setEditingId(record.id);
    setSelectedPlatform(record.platform);
    form.setFieldsValue({
      name: record.name,
      platform: record.platform,
      account_name: record.account_name,
      account_type: record.account_type,
    });
    setModalOpen(true);
  };

  // ─── Save ───
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        name: values.name,
        platform: values.platform,
        account_name: values.account_name,
        account_type: values.account_type,
      };

      if (editingId) {
        const { error } = await supabase
          .from('trading_accounts')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        message.success('Đã cập nhật tài khoản');
      } else {
        const { error } = await supabase
          .from('trading_accounts')
          .insert(payload);
        if (error) throw error;
        message.success('Đã tạo tài khoản mới');
      }

      setModalOpen(false);
      fetchAccounts();
    } catch (err: any) {
      if (err?.message) message.error('Lỗi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('trading_accounts')
      .delete()
      .eq('id', id);
    if (error) { message.error('Xóa thất bại'); return; }
    message.success('Đã xóa tài khoản');
    fetchAccounts();
  };

  // ─── All types for filter (flat list) ───
  const allTypes = Object.values(ACCOUNT_TYPES).flat();

  // ─── Columns ───
  const columns = [
    {
      title: 'Tên tài khoản',
      dataIndex: 'name',
      key: 'name',
      render: (val: string) => <strong>{val}</strong>,
    },
    {
      title: 'Nền tảng',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (val: string) => <Tag color={PLATFORM_COLOR[val] || 'default'}>{val}</Tag>,
    },
    {
      title: 'Loại tài khoản',
      dataIndex: 'account_type',
      key: 'account_type',
      width: 180,
      render: (val: string) => <Tag>{val}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_: any, record: TradingAccount) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa tài khoản này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Tài khoản giao dịch</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo tài khoản
        </Button>
      </div>

      {/* Filters */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Input
            placeholder="Tìm tên tài khoản..."
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Nền tảng"
            allowClear
            onChange={(val) => setFilterPlatform(val)}
          >
            {PLATFORMS.map((p) => <Option key={p} value={p}>{p}</Option>)}
          </Select>
        </Col>
        <Col xs={12} sm={10}>
          <Select
            style={{ width: '100%' }}
            placeholder="Loại tài khoản"
            allowClear
            onChange={(val) => setFilterType(val)}
          >
            {allTypes.map((t) => <Option key={t} value={t}>{t}</Option>)}
          </Select>
        </Col>
      </Row>

      {/* Table */}
      <Table
        dataSource={accounts}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (total) => `${total} tài khoản`, size: 'small' }}
        size="small"
      />

      {/* Modal */}
      <Modal
        title={editingId ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editingId ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
        confirmLoading={saving}
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {/* Hàng 1: Tên (auto) */}
          <Form.Item name="name" label="Tên tài khoản (tự động)">
            <Input
              readOnly
              placeholder="Tự động điền"
              style={{ background: token.colorFillAlter, cursor: 'default' }}
            />
          </Form.Item>

          {/* Hàng 2: Nền tảng */}
          <Form.Item
            name="platform"
            label="Nền tảng"
            rules={[{ required: true, message: 'Vui lòng chọn nền tảng' }]}
          >
            <Select
              placeholder="Chọn nền tảng"
              onChange={(val) => {
                setSelectedPlatform(val);
                form.setFieldValue('account_type', undefined);
                updateName();
              }}
            >
              {PLATFORMS.map((p) => <Option key={p} value={p}>{p}</Option>)}
            </Select>
          </Form.Item>

          {/* Hàng 3: Tên tài khoản (nhập tay) */}
          <Form.Item
            name="account_name"
            label="Tên tài khoản"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản' }]}
          >
            <Input
              placeholder="VD: Main, Prop 01..."
              onChange={() => setTimeout(updateName, 0)}
            />
          </Form.Item>

          {/* Hàng 4: Loại tài khoản */}
          <Form.Item
            name="account_type"
            label="Loại tài khoản"
            rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản' }]}
          >
            <Select
              placeholder="Chọn loại tài khoản"
              onChange={() => updateName()}
            >
              {(ACCOUNT_TYPES[selectedPlatform] || []).map((t) => (
                <Option key={t} value={t}>{t}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}