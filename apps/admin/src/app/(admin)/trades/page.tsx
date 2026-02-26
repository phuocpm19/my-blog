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
  InputNumber,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tag,
  Spin,
  Row,
  Col,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { supabase } from '@/lib/supabase';

const { Title, Text } = Typography;

interface Trade {
  id: string;
  platform: string | null;
  pair: string;
  side: 'long' | 'short';
  entry_price: number;
  exit_price: number | null;
  sl: number | null;
  tp: number | null;
  quantity: number;
  pnl: number;
  fee: number;
  leverage: number;
  strategy: string | null;
  exit_reason: string | null;
  notes: string | null;
  trade_date: string;
  report_id: string | null;
  created_at: string;
}

interface ReportOption {
  id: string;
  title: string;
  report_date: string;
}

const PLATFORMS = ['FTMO', 'Exness', 'Binance', 'Bybit', 'OKX', 'Khác'];
const PAIRS = ['BTC', 'ETH', 'XAU', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'Khác'];
const EXIT_REASONS = ['Chốt lời (TP)', 'Cắt lỗ (SL)', 'Thủ công', 'Trailing Stop', 'Break Even', 'Hết phiên'];

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [reports, setReports] = useState<ReportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form] = Form.useForm();

  // ─── Load trades ───
  const loadTrades = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('trade_date', { ascending: false });

    if (error) {
      message.error('Lỗi tải giao dịch: ' + error.message);
    } else {
      setTrades(data || []);
    }
    setLoading(false);
  }, []);

  // ─── Load reports (cho select) ───
  const loadReports = useCallback(async () => {
    const { data } = await supabase
      .from('trading_reports')
      .select('id, title, report_date')
      .order('report_date', { ascending: false });
    setReports(data || []);
  }, []);

  useEffect(() => {
    loadTrades();
    loadReports();
  }, [loadTrades, loadReports]);

  // ─── Filter ───
  const filtered = trades.filter((t) => {
    const matchSearch =
      t.pair.toLowerCase().includes(search.toLowerCase()) ||
      (t.platform || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.strategy || '').toLowerCase().includes(search.toLowerCase());
    const matchSide = !sideFilter || t.side === sideFilter;
    return matchSearch && matchSide;
  });

  // ─── Mở modal tạo mới ───
  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      trade_date: dayjs(),
      side: 'long',
      leverage: 1,
      fee: 0,
      pnl: 0,
    });
    setModalOpen(true);
  };

  // ─── Mở modal chỉnh sửa ───
  const handleEdit = (record: Trade) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      trade_date: dayjs(record.trade_date),
    });
    setModalOpen(true);
  };

  // ─── Xóa trade ───
  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) {
      message.error('Lỗi xóa: ' + error.message);
    } else {
      message.success('Đã xóa giao dịch');
      await loadTrades();
    }
    setActionLoading(null);
  };

  // ─── Submit form ───
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const tradeData = {
        platform: values.platform || null,
        pair: values.pair,
        side: values.side,
        entry_price: values.entry_price,
        exit_price: values.exit_price ?? null,
        sl: values.sl ?? null,
        tp: values.tp ?? null,
        quantity: values.quantity,
        pnl: values.pnl ?? 0,
        fee: values.fee ?? 0,
        leverage: values.leverage ?? 1,
        strategy: values.strategy || null,
        exit_reason: values.exit_reason || null,
        notes: values.notes || null,
        trade_date: values.trade_date.toISOString(),
        report_id: values.report_id || null,
      };

      if (editing) {
        const { error } = await supabase
          .from('trades')
          .update(tradeData)
          .eq('id', editing.id);
        if (error) throw error;
        message.success('Đã cập nhật giao dịch');
      } else {
        const { error } = await supabase.from('trades').insert(tradeData);
        if (error) throw error;
        message.success('Đã thêm giao dịch mới');
      }

      setModalOpen(false);
      form.resetFields();
      loadTrades();
    } catch (err: any) {
      if (err?.message) {
        message.error('Lỗi: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // ─── Table columns ───
  const columns: TableColumnsType<Trade> = [
    {
      title: 'Ngày',
      dataIndex: 'trade_date',
      key: 'trade_date',
      width: 100,
      render: (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      title: 'Nền tảng',
      dataIndex: 'platform',
      key: 'platform',
      width: 90,
      render: (p: string | null) => p || <Text type="secondary">—</Text>,
    },
    {
      title: 'Cặp',
      dataIndex: 'pair',
      key: 'pair',
      width: 80,
      render: (pair: string) => <Text strong>{pair}</Text>,
    },
    {
      title: 'Vị thế',
      dataIndex: 'side',
      key: 'side',
      width: 80,
      align: 'center',
      render: (side: string) => (
        <Tag color={side === 'long' ? 'green' : 'red'}>
          {side === 'long' ? 'LONG' : 'SHORT'}
        </Tag>
      ),
    },
    {
      title: 'Entry',
      dataIndex: 'entry_price',
      key: 'entry_price',
      width: 100,
      align: 'right',
      render: (v: number) => v?.toLocaleString('en-US'),
    },
    {
      title: 'SL',
      dataIndex: 'sl',
      key: 'sl',
      width: 100,
      align: 'right',
      render: (v: number | null) =>
        v != null ? v.toLocaleString('en-US') : <Text type="secondary">—</Text>,
    },
    {
      title: 'TP',
      dataIndex: 'tp',
      key: 'tp',
      width: 100,
      align: 'right',
      render: (v: number | null) =>
        v != null ? v.toLocaleString('en-US') : <Text type="secondary">—</Text>,
    },
    {
      title: 'Exit',
      dataIndex: 'exit_price',
      key: 'exit_price',
      width: 100,
      align: 'right',
      render: (v: number | null) =>
        v != null ? v.toLocaleString('en-US') : <Text type="secondary">—</Text>,
    },
    {
      title: 'PnL',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 100,
      align: 'right',
      render: (pnl: number) => (
        <Text style={{ color: pnl >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {pnl >= 0 ? '+' : ''}
          {pnl?.toLocaleString('en-US')}
        </Text>
      ),
    },
    {
      title: 'Phí',
      dataIndex: 'fee',
      key: 'fee',
      width: 70,
      align: 'right',
      render: (fee: number) => fee?.toLocaleString('en-US'),
    },
    {
      title: 'Thoát lệnh',
      dataIndex: 'exit_reason',
      key: 'exit_reason',
      width: 110,
      render: (r: string | null) => r || <Text type="secondary">—</Text>,
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_: any, record: Trade) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={actionLoading === record.id}
          />
          <Popconfirm
            title="Xóa giao dịch?"
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

  // ─── Tính tổng PnL ───
  const totalPnl = filtered.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalFee = filtered.reduce((sum, t) => sum + (t.fee || 0), 0);
  const winCount = filtered.filter((t) => t.pnl > 0).length;
  const winRate = filtered.length > 0 ? ((winCount / filtered.length) * 100).toFixed(1) : '0';

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
          Giao dịch
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm giao dịch
        </Button>
      </div>

      {/* ─── Summary bar ─── */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginBottom: 16,
          padding: '12px 16px',
          background: '#fafafa',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <span>
          Tổng GD: <Text strong>{filtered.length}</Text>
        </span>
        <span>
          Win rate:{' '}
          <Text strong style={{ color: '#52c41a' }}>
            {winRate}%
          </Text>
        </span>
        <span>
          Profit:{' '}
          <Text strong style={{ color: totalPnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {totalPnl >= 0 ? '+' : ''}
            {totalPnl.toLocaleString('en-US')}
          </Text>
        </span>
        <span>
          Phí: <Text strong>{totalFee.toLocaleString('en-US')}</Text>
        </span>
        <span>
          Thực nhận:{' '}
          <Text
            strong
            style={{ color: totalPnl - totalFee >= 0 ? '#52c41a' : '#ff4d4f' }}
          >
            {(totalPnl - totalFee).toLocaleString('en-US')}
          </Text>
        </span>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo cặp, nền tảng..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 280 }}
        />
        <Select
          placeholder="Vị thế"
          allowClear
          value={sideFilter}
          onChange={setSideFilter}
          style={{ width: 120 }}
          options={[
            { value: 'long', label: 'Long' },
            { value: 'short', label: 'Short' },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 15,
          showTotal: (total) => `Tổng ${total} giao dịch`,
        }}
        locale={{ emptyText: 'Chưa có giao dịch nào' }}
      />

      {/* ─── Modal Tạo / Sửa ─── */}
      <Modal
        title={editing ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText={editing ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        confirmLoading={saving}
        width={720}
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="trade_date" label="Ngày" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="platform" label="Nền tảng">
                <Select
                  placeholder="Chọn nền tảng"
                  allowClear
                  options={PLATFORMS.map((p) => ({ value: p, label: p }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="pair"
                label="Cặp giao dịch"
                rules={[{ required: true, message: 'Vui lòng chọn cặp' }]}
              >
                <Select
                  placeholder="VD: ETH"
                  allowClear
                  showSearch
                  options={PAIRS.map((p) => ({ value: p, label: p }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="side"
                label="Vị thế"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: 'long', label: 'LONG (Buy)' },
                    { value: 'short', label: 'SHORT (Sell)' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Khối lượng"
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="0.01" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="leverage" label="Đòn bẩy">
                <InputNumber style={{ width: '100%' }} min={1} max={200} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="entry_price"
                label="Giá vào (Entry)"
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="sl" label="Stop Loss">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="tp" label="Take Profit">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="exit_price" label="Giá đóng (Exit)">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="pnl" label="Profit/Loss (PnL)">
                <InputNumber style={{ width: '100%' }} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fee" label="Phí giao dịch">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="exit_reason" label="Lý do thoát lệnh">
                <Select
                  placeholder="Chọn lý do"
                  allowClear
                  options={EXIT_REASONS.map((r) => ({ value: r, label: r }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="strategy" label="Lý do vào lệnh">
                <Input placeholder="VD: Break of structure, FVG..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="report_id" label="Trading Report">
                <Select
                  placeholder="Liên kết report (không bắt buộc)"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={reports.map((r) => ({
                    value: r.id,
                    label: `${r.title} (${new Date(r.report_date).toLocaleDateString('vi-VN')})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Bài học rút ra">
            <Input.TextArea rows={3} placeholder="Ghi chú, bài học rút ra từ giao dịch này..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
