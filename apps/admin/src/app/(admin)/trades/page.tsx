'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Typography, Table, Button, Space, Input, Modal, Form,
  InputNumber, Select, DatePicker, message, Popconfirm, Tag, Row, Col,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { supabase } from '@/lib/supabase';

const { Title, Text } = Typography;
const { Option } = Select;

interface Trade {
  id: string;
  title: string | null;
  platform: string | null;
  account_name: string | null;
  pair: string;
  side: 'long' | 'short';
  entry_order: string | null;
  order_status: string | null;
  entry_price: number;
  actual_entry_price: number | null;
  open_time: string | null;
  exit_price: number | null;
  actual_exit_price: number | null;
  close_time: string | null;
  sl: number | null;
  tp: number | null;
  trade_code: string | null;
  quantity: number;
  pnl: number;
  fee: number;
  swap: number | null;
  actual_pnl: number | null;
  leverage: number;
  strategy: string | null;
  exit_reason: string | null;
  notes: string | null;
  trade_date: string;
  report_id: string | null;
  created_at: string;
}

interface ReportOption { id: string; title: string; report_date: string; }
interface AccountOption { id: string; name: string; platform: string; }

const PLATFORMS = ['Exness', 'FTMO'];
const PAIRS = ['BTC', 'ETH', 'XAU'];
const ORDER_STATUSES = ['Chưa vào lệnh', 'Đang chờ', 'Đã khớp', 'Đã đóng', 'Huỷ'];
const EXIT_REASONS = ['Stop Loss', 'Take Profit', 'Thủ công'];

const STATUS_COLOR: Record<string, string> = {
  'Chưa vào lệnh': 'default',
  'Đang chờ': 'gold',
  'Đã khớp': 'blue',
  'Đã đóng': 'green',
  'Huỷ': 'red',
};

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [reports, setReports] = useState<ReportOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPair, setFilterPair] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form] = Form.useForm();

  // ─── Load ───
  const loadTrades = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades').select('*').order('trade_date', { ascending: false });
    if (error) message.error('Lỗi tải giao dịch: ' + error.message);
    else setTrades(data || []);
    setLoading(false);
  }, []);

  const loadReports = useCallback(async () => {
    const { data } = await supabase
      .from('trading_reports').select('id, title, report_date')
      .order('report_date', { ascending: false });
    setReports(data || []);
  }, []);

  const loadAccounts = useCallback(async () => {
    const { data } = await supabase
      .from('trading_accounts').select('id, name, platform')
      .order('name', { ascending: true });
    setAccounts(data || []);
  }, []);

  useEffect(() => {
    loadTrades(); loadReports(); loadAccounts();
  }, [loadTrades, loadReports, loadAccounts]);

  // ─── Auto-generate title ───
  const updateTitle = () => {
    const date = form.getFieldValue('trade_date');
    const pair = form.getFieldValue('pair');
    const side = form.getFieldValue('side');
    const entryOrder = form.getFieldValue('entry_order');
    const accountName = form.getFieldValue('account_name');
    if (date && pair && side) {
      const sideLabel = side === 'long' ? 'Long' : 'Short';
      const orderPart = entryOrder ? ` ${entryOrder}` : '';
      const accountPart = accountName ? ` ${accountName}` : '';
      form.setFieldValue(
        'title',
        `${dayjs(date).format('YYYYMMDD')} ${pair} ${sideLabel}${orderPart}${accountPart}`
      );
    }
  };

  // ─── Filter ───
  const filtered = trades.filter((t) => {
    const matchSearch = !search ||
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      t.pair.toLowerCase().includes(search.toLowerCase());
    const matchSide = !sideFilter || t.side === sideFilter;
    const matchDate = !filterDate || t.trade_date.startsWith(filterDate.format('YYYY-MM-DD'));
    const matchPlatform = !filterPlatform || t.platform === filterPlatform;
    const matchStatus = !filterStatus || t.order_status === filterStatus;
    const matchPair = !filterPair || t.pair === filterPair;
    return matchSearch && matchSide && matchDate && matchPlatform && matchStatus && matchPair;
  });

  // ─── Open modal ───
  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      trade_date: dayjs(), side: 'long', platform: 'Exness', pair: 'BTC', fee: 0, pnl: 0,
    });
    setModalOpen(true);
  };

  const handleEdit = (record: Trade) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      trade_date: record.trade_date ? dayjs(record.trade_date) : null,
      open_time: record.open_time ? dayjs(record.open_time) : null,
      close_time: record.close_time ? dayjs(record.close_time) : null,
    });
    setModalOpen(true);
  };

  // ─── Delete ───
  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) message.error('Lỗi xóa: ' + error.message);
    else { message.success('Đã xóa giao dịch'); await loadTrades(); }
    setActionLoading(null);
  };

  // ─── Submit ───
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const tradeData = {
        title: values.title || null,
        platform: values.platform || null,
        account_name: values.account_name || null,
        pair: values.pair,
        side: values.side,
        entry_order: values.entry_order || null,
        order_status: values.order_status || null,
        entry_price: values.entry_price,
        actual_entry_price: values.actual_entry_price ?? null,
        open_time: values.open_time ? values.open_time.toISOString() : null,
        exit_price: values.exit_price ?? null,
        actual_exit_price: values.actual_exit_price ?? null,
        close_time: values.close_time ? values.close_time.toISOString() : null,
        sl: values.sl ?? null,
        tp: values.tp ?? null,
        trade_code: values.trade_code || null,
        quantity: values.quantity,
        pnl: values.pnl ?? 0,
        fee: values.fee ?? 0,
        swap: values.swap ?? null,
        actual_pnl: values.actual_pnl ?? null,
        leverage: values.leverage ?? 1,
        strategy: values.strategy || null,
        exit_reason: values.exit_reason || null,
        notes: values.notes || null,
        trade_date: values.trade_date.toISOString(),
        report_id: values.report_id || null,
      };

      if (editing) {
        const { error } = await supabase.from('trades').update(tradeData).eq('id', editing.id);
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
      if (err?.message) message.error('Lỗi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const numCol = (title: string, key: string, color?: (v: number) => string) => ({
    title, dataIndex: key, key, width: 100, align: 'right' as const,
    render: (v: number | null) => v != null
      ? <Text style={color ? { color: color(v), fontWeight: 600 } : {}}>{v >= 0 ? (color ? '+' : '') : ''}{v.toLocaleString('en-US')}</Text>
      : <Text type="secondary">—</Text>,
  });

  const dtCol = (title: string, key: string) => ({
    title, dataIndex: key, key, width: 130,
    render: (v: string | null) => v ? dayjs(v).format('DD/MM/YY HH:mm') : <Text type="secondary">—</Text>,
  });

  // ─── Columns ───
  const columns: TableColumnsType<Trade> = [
    {
      title: 'Ngày', dataIndex: 'trade_date', key: 'trade_date', width: 90, fixed: 'left' as const,
      render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Tên giao dịch', dataIndex: 'title', key: 'title', width: 200, fixed: 'left' as const,
      render: (v: string | null, record) => <Text strong>{v || record.pair}</Text>,
    },
    {
      title: 'Cặp', dataIndex: 'pair', key: 'pair', width: 70,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Vị thế', dataIndex: 'side', key: 'side', width: 80, align: 'center' as const,
      render: (side: string) => <Tag color={side === 'long' ? 'green' : 'red'}>{side === 'long' ? 'LONG' : 'SHORT'}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'order_status', key: 'order_status', width: 120,
      render: (v: string | null) => v
        ? <Tag color={STATUS_COLOR[v] || 'default'}>{v}</Tag>
        : <Text type="secondary">—</Text>,
    },
    numCol('Entry', 'entry_price'),
    numCol('Entry TT', 'actual_entry_price'),
    dtCol('T/g mở', 'open_time'),
    numCol('Exit', 'exit_price'),
    numCol('Exit TT', 'actual_exit_price'),
    dtCol('T/g đóng', 'close_time'),
    numCol('SL', 'sl'),
    numCol('TP', 'tp'),
    numCol('PnL', 'pnl', (v) => v >= 0 ? '#52c41a' : '#ff4d4f'),
    numCol('Phí GD', 'fee'),
    numCol('Phí ĐM', 'swap'),
    numCol('PnL TT', 'actual_pnl', (v) => v >= 0 ? '#52c41a' : '#ff4d4f'),
    {
      title: '', key: 'actions', width: 80, fixed: 'right' as const, align: 'center' as const,
      render: (_: any, record: Trade) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} disabled={actionLoading === record.id} />
          <Popconfirm title="Xóa giao dịch?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} loading={actionLoading === record.id} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalPnl = filtered.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalFee = filtered.reduce((sum, t) => sum + (t.fee || 0), 0);
  const winCount = filtered.filter((t) => t.pnl > 0).length;
  const winRate = filtered.length > 0 ? ((winCount / filtered.length) * 100).toFixed(1) : '0';

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Giao dịch</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Thêm giao dịch</Button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 8, fontSize: 14 }}>
        <span>Tổng GD: <Text strong>{filtered.length}</Text></span>
        <span>Win rate: <Text strong style={{ color: '#52c41a' }}>{winRate}%</Text></span>
        <span>Profit: <Text strong style={{ color: totalPnl >= 0 ? '#52c41a' : '#ff4d4f' }}>{totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString('en-US')}</Text></span>
        <span>Phí: <Text strong>{totalFee.toLocaleString('en-US')}</Text></span>
        <span>Thực nhận: <Text strong style={{ color: totalPnl - totalFee >= 0 ? '#52c41a' : '#ff4d4f' }}>{(totalPnl - totalFee).toLocaleString('en-US')}</Text></span>
      </div>

      {/* Filters */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Input placeholder="Tìm tên giao dịch..." prefix={<SearchOutlined />} value={search}
            onChange={(e) => setSearch(e.target.value)} allowClear />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <DatePicker style={{ width: '100%' }} placeholder="Ngày" format="DD/MM/YYYY"
            onChange={(val) => setFilterDate(val)} />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Select style={{ width: '100%' }} placeholder="Nền tảng" allowClear onChange={(val) => setFilterPlatform(val)}>
            {PLATFORMS.map((p) => <Option key={p} value={p}>{p}</Option>)}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select style={{ width: '100%' }} placeholder="Trạng thái" allowClear onChange={(val) => setFilterStatus(val)}>
            {ORDER_STATUSES.map((s) => <Option key={s} value={s}>{s}</Option>)}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Select style={{ width: '100%' }} placeholder="Cặp" allowClear onChange={(val) => setFilterPair(val)}>
            {PAIRS.map((p) => <Option key={p} value={p}>{p}</Option>)}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Select style={{ width: '100%' }} placeholder="Vị thế" allowClear onChange={(val) => setSideFilter(val)}>
            <Option value="long">Long</Option>
            <Option value="short">Short</Option>
          </Select>
        </Col>
        <Col xs={12} sm={6} md={2}>
          <Button style={{ width: '100%' }} onClick={() => {
            setSearch(''); setFilterDate(null); setFilterPlatform(null);
            setFilterStatus(null); setFilterPair(null); setSideFilter(null);
          }}>✕</Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} scroll={{ x: 1600 }}
        pagination={{ pageSize: 15, showTotal: (total) => `Tổng ${total} giao dịch` }}
        locale={{ emptyText: 'Chưa có giao dịch nào' }}
      />

      {/* ─── Modal ─── */}
      <Modal
        title={editing ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleSubmit}
        okText={editing ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        confirmLoading={saving}
        width={800}
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

          {/* Hàng 1: Tên giao dịch | Ngày | Lần vào lệnh */}
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="title" label="Tên giao dịch">
                <Input placeholder="Tự động điền" readOnly style={{ background: '#f5f5f5', cursor: 'default' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="trade_date" label="Ngày" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YYYY HH:mm" onChange={() => updateTitle()} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="entry_order" label="Lần vào lệnh">
                <Input placeholder="VD: L1, L2..." onChange={() => updateTitle()} />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 2: Nền tảng | Tên tài khoản (select) | Trạng thái lệnh */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="platform" label="Nền tảng">
                <Select placeholder="Chọn nền tảng" onChange={() => updateTitle()}>
                  {PLATFORMS.map((p) => <Option key={p} value={p}>{p}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="account_name" label="Tên tài khoản">
                <Select
                  placeholder="Chọn tài khoản"
                  allowClear showSearch optionFilterProp="label"
                  onChange={(val) => { form.setFieldValue('account_name', val); updateTitle(); }}
                >
                  {accounts.map((a) => (
                    <Option key={a.id} value={a.name} label={a.name}>{a.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="order_status" label="Trạng thái lệnh">
                <Select placeholder="Chọn trạng thái" allowClear>
                  {ORDER_STATUSES.map((s) => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 3: Cặp | Vị thế | Khối lượng */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="pair" label="Cặp giao dịch" rules={[{ required: true, message: 'Vui lòng chọn cặp' }]}>
                <Select placeholder="Chọn cặp" onChange={() => updateTitle()}>
                  {PAIRS.map((p) => <Option key={p} value={p}>{p}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="side" label="Vị thế" rules={[{ required: true }]}>
                <Select onChange={() => updateTitle()}>
                  <Option value="long">LONG (Buy)</Option>
                  <Option value="short">SHORT (Sell)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quantity" label="Khối lượng" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="0.01" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 4: Entry | Entry thực tế | Thời gian mở */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="entry_price" label="Entry" rules={[{ required: true, message: 'Vui lòng nhập' }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="actual_entry_price" label="Entry thực tế">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="open_time" label="Thời gian mở">
                <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 5: Giá đóng | Giá đóng thực tế | Thời gian đóng */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="exit_price" label="Giá đóng">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="actual_exit_price" label="Giá đóng thực tế">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="close_time" label="Thời gian đóng">
                <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 6: SL | TP | Mã giao dịch */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sl" label="Stop Loss">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tp" label="Take Profit">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="trade_code" label="Mã giao dịch">
                <Input placeholder="VD: TXN-001..." />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 7: PnL | Phí GD | Phí qua đêm | PnL thực tế */}
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="pnl" label="Profit/Lot (PnL)">
                <InputNumber style={{ width: '100%' }} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="fee" label="Phí giao dịch">
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="swap" label="Phí qua đêm">
                <InputNumber style={{ width: '100%' }} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="actual_pnl" label="PnL thực tế">
                <InputNumber style={{ width: '100%' }} step={0.01} />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 8: Trading Report | Lý do đóng lệnh */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="report_id" label="Trading Report">
                <Select placeholder="Liên kết report (không bắt buộc)" allowClear showSearch optionFilterProp="label"
                  options={reports.map((r) => ({
                    value: r.id,
                    label: `${r.title} (${new Date(r.report_date).toLocaleDateString('vi-VN')})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="exit_reason" label="Lý do đóng lệnh">
                <Select placeholder="Chọn lý do" allowClear
                  options={EXIT_REASONS.map((r) => ({ value: r, label: r }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 9: Lý do vào lệnh | Bài học rút ra */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="strategy" label="Lý do vào lệnh">
                <Input.TextArea rows={5} placeholder="Lý do vào lệnh, setup, confluence..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="notes" label="Bài học rút ra">
                <Input.TextArea rows={5} placeholder="Bài học rút ra từ giao dịch này..." />
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Modal>
    </>
  );
}