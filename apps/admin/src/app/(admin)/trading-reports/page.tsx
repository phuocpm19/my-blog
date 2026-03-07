'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Space, Input, Select, DatePicker, Popconfirm,
  message, Typography, Tag, Modal, Row, Col, Card, Descriptions,
  Tooltip, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, DownloadOutlined, SearchOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface TradingReport {
  id: string;
  title: string;
  report_date: string;
  pair: string;
  session: string;
  content: string;
  created_at: string;
}

const PAIRS = ['BTC', 'ETH', 'XAU'];
const SESSIONS = ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];

const SESSION_COLOR: Record<string, string> = {
  'Session 1': 'blue',
  'Session 2': 'cyan',
  'Session 3': 'green',
  'Session 4': 'orange',
  'Session 5': 'purple',
};

const SESSION_BORDER: Record<string, string> = {
  'Session 1': '#91caff',
  'Session 2': '#87e8de',
  'Session 3': '#b7eb8f',
  'Session 4': '#ffd591',
  'Session 5': '#d3adf7',
};

const SESSION_TITLE_COLOR: Record<string, string> = {
  'Session 1': '#1677ff',
  'Session 2': '#13c2c2',
  'Session 3': '#52c41a',
  'Session 4': '#fa8c16',
  'Session 5': '#722ed1',
};

const PAIR_COLOR: Record<string, string> = {
  BTC: 'gold',
  ETH: 'blue',
  XAU: 'green',
};

// Màu cho 3 card theo ngày (cùng màu nhau)
const DATE_BORDER = '#d9d9d9';
const DATE_TITLE_COLOR = '#595959';
// Chiều cao cố định cho 5 item (mỗi item ~32px)
const LIST_ITEM_HEIGHT = 32;
const LIST_MAX_ITEMS = 5;
const LIST_BODY_HEIGHT = LIST_ITEM_HEIGHT * LIST_MAX_ITEMS; // 160px

// ─── RecentCard component ───
function RecentCard({
  title,
  titleColor,
  borderColor,
  reports,
  onView,
}: {
  title: string;
  titleColor: string;
  borderColor: string;
  reports: TradingReport[];
  onView: (r: TradingReport) => void;
}) {
  // Pad to LIST_MAX_ITEMS with nulls for fixed height
  const padded: (TradingReport | null)[] = [
    ...reports.slice(0, LIST_MAX_ITEMS),
    ...Array(Math.max(0, LIST_MAX_ITEMS - reports.length)).fill(null),
  ];

  return (
    <Card
      size="small"
      title={<span style={{ color: titleColor, fontWeight: 600, fontSize: 12 }}>{title}</span>}
      style={{ borderColor, borderWidth: 1.5 }}
      styles={{
        header: { borderBottomColor: borderColor, minHeight: 36, padding: '0 12px' },
        body: { padding: '4px 12px' },
      }}
    >
      <div style={{ height: LIST_BODY_HEIGHT }}>
        {padded.map((r, i) => (
          <div
            key={i}
            style={{
              height: LIST_ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              borderBottom: i < LIST_MAX_ITEMS - 1 ? '1px solid #f5f5f5' : 'none',
            }}
          >
            {r ? (
              <Text
                ellipsis={{ tooltip: r.title }}
                style={{
                  cursor: 'pointer',
                  color: titleColor,
                  fontSize: 12,
                  width: '100%',
                }}
                onClick={() => onView(r)}
              >
                {r.title || `${dayjs(r.report_date).format('YYYYMMDD')} ${r.pair} ${r.session}`}
              </Text>
            ) : (
              <span style={{ color: '#d9d9d9', fontSize: 12 }}>—</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function TradingReportsPage() {
  const [allReports, setAllReports] = useState<TradingReport[]>([]);
  const [reports, setReports] = useState<TradingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);
  const [filterPair, setFilterPair] = useState<string | null>(null);
  const [filterSession, setFilterSession] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<TradingReport | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Load all reports for recent lists
  const loadAllReports = useCallback(async () => {
    const { data } = await supabase
      .from('trading_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .order('created_at', { ascending: false });
    setAllReports(data || []);
  }, []);

  useEffect(() => { loadAllReports(); }, [loadAllReports]);

  // Load filtered reports for table
  const fetchReports = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('trading_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) query = query.ilike('title', `%${search}%`);
    if (filterDate) query = query.eq('report_date', filterDate.format('YYYY-MM-DD'));
    if (filterPair) query = query.eq('pair', filterPair);
    if (filterSession) query = query.eq('session', filterSession);

    const { data, error } = await query;
    if (error) message.error('Lỗi tải dữ liệu');
    else setReports(data || []);
    setLoading(false);
  }, [search, filterDate, filterPair, filterSession]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // ─── Derived data ───
  const dateStr = (offset: number) => dayjs().subtract(offset, 'day').format('YYYY-MM-DD');
  const dateLabel = (offset: number) => {
    const d = dayjs().subtract(offset, 'day');
    if (offset === 0) return `Hôm nay — ${d.format('DD/MM/YYYY')}`;
    return d.format('DD/MM/YYYY');
  };

  const reportsByDate = (offset: number) =>
    allReports
      .filter((r) => r.report_date === dateStr(offset))
      .sort((a, b) => SESSIONS.indexOf(a.session) - SESSIONS.indexOf(b.session));

  const recentBySession = (session: string) =>
    allReports.filter((r) => r.session === session).slice(0, LIST_MAX_ITEMS);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('trading_reports').delete().eq('id', id);
    if (error) { message.error('Xóa thất bại'); return; }
    message.success('Đã xóa báo cáo');
    fetchReports();
    loadAllReports();
  };

  const handleView = (report: TradingReport) => {
    setViewReport(report);
    setViewModalOpen(true);
  };

  const handleExport = (report: TradingReport) => {
    const dateStr = dayjs(report.report_date).format('YYYYMMDD');
    const sessionSlug = report.session.replace(' ', '');
    const fileName = `Report_${dateStr}_${report.pair}_${sessionSlug}.txt`;
    const fileContent = [
      `Tiêu đề: ${report.title}`,
      `Ngày: ${dayjs(report.report_date).format('DD/MM/YYYY')}`,
      `Session: ${report.session}`,
      `Cặp giao dịch: ${report.pair}`,
      '',
      '--- NỘI DUNG ---',
      '',
      report.content || '',
    ].join('\n');

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`Đã xuất file ${fileName}`);
  };

  const columns: ColumnsType<TradingReport> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Text style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => handleView(record)}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'report_date',
      key: 'report_date',
      width: 120,
      render: (val) => dayjs(val).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.report_date).unix() - dayjs(b.report_date).unix(),
    },
    {
      title: 'Cặp',
      dataIndex: 'pair',
      key: 'pair',
      width: 80,
      render: (val) => val ? <Tag color={PAIR_COLOR[val] || 'default'}>{val}</Tag> : '-',
    },
    {
      title: 'Session',
      dataIndex: 'session',
      key: 'session',
      width: 120,
      render: (val) => val ? <Tag color={SESSION_COLOR[val] || 'default'}>{val}</Tag> : '-',
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem báo cáo">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Xuất file .txt">
            <Button size="small" icon={<DownloadOutlined />} onClick={() => handleExport(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Link href={`/trading-reports/${record.id}/edit`}>
              <Button size="small" icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Xóa báo cáo này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Trading Reports</Title>
        <Link href="/trading-reports/new">
          <Button type="primary" icon={<PlusOutlined />}>Tạo báo cáo</Button>
        </Link>
      </div>

      {/* ── MAIN ROW: Recent (left) + All (right) ── */}
      <Row gutter={24} align="top">

        {/* ── LEFT: Báo cáo gần đây ── */}
        <Col xs={24} xl={10}>
          <Title level={5} style={{ marginBottom: 12, color: '#8c8c8c', fontWeight: 500 }}>
            Báo cáo gần đây
          </Title>

          <Row gutter={[8, 8]}>
            {/* Cột 1: Hôm nay / Hôm qua / Hôm kia */}
            <Col span={8}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <RecentCard
                  title={dateLabel(0)}
                  titleColor={DATE_TITLE_COLOR}
                  borderColor={DATE_BORDER}
                  reports={reportsByDate(0)}
                  onView={handleView}
                />
                <RecentCard
                  title={dateLabel(1)}
                  titleColor={DATE_TITLE_COLOR}
                  borderColor={DATE_BORDER}
                  reports={reportsByDate(1)}
                  onView={handleView}
                />
                <RecentCard
                  title={dateLabel(2)}
                  titleColor={DATE_TITLE_COLOR}
                  borderColor={DATE_BORDER}
                  reports={reportsByDate(2)}
                  onView={handleView}
                />
              </div>
            </Col>

            {/* Cột 2: SS1 / SS3 / SS5 */}
            <Col span={8}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(['Session 1', 'Session 3', 'Session 5'] as const).map((ss) => (
                  <RecentCard
                    key={ss}
                    title={ss}
                    titleColor={SESSION_TITLE_COLOR[ss]}
                    borderColor={SESSION_BORDER[ss]}
                    reports={recentBySession(ss)}
                    onView={handleView}
                  />
                ))}
              </div>
            </Col>

            {/* Cột 3: SS2 / SS4 */}
            <Col span={8}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(['Session 2', 'Session 4'] as const).map((ss) => (
                  <RecentCard
                    key={ss}
                    title={ss}
                    titleColor={SESSION_TITLE_COLOR[ss]}
                    borderColor={SESSION_BORDER[ss]}
                    reports={recentBySession(ss)}
                    onView={handleView}
                  />
                ))}
              </div>
            </Col>
          </Row>
        </Col>

        {/* ── RIGHT: Tất cả báo cáo ── */}
        <Col xs={24} xl={14}>
          <Title level={5} style={{ marginBottom: 12, color: '#8c8c8c', fontWeight: 500 }}>
            Tất cả báo cáo
          </Title>

          {/* Filters */}
          <Card style={{ marginBottom: 12 }} styles={{ body: { padding: '12px 16px' } }}>
            <Row gutter={[8, 8]} align="middle">
              <Col span={24}>
                <Input
                  placeholder="Tìm kiếm tên báo cáo..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
              </Col>
              <Col span={8}>
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Lọc ngày"
                  value={filterDate}
                  onChange={(val) => setFilterDate(val)}
                  format="DD/MM/YYYY"
                />
              </Col>
              <Col span={7}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Cặp"
                  value={filterPair}
                  onChange={(val) => setFilterPair(val)}
                  allowClear
                >
                  {PAIRS.map((p) => <Option key={p} value={p}>{p}</Option>)}
                </Select>
              </Col>
              <Col span={7}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Session"
                  value={filterSession}
                  onChange={(val) => setFilterSession(val)}
                  allowClear
                >
                  {SESSIONS.map((s) => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Col>
              <Col span={2}>
                <Button
                  style={{ width: '100%' }}
                  onClick={() => {
                    setSearch('');
                    setFilterDate(null);
                    setFilterPair(null);
                    setFilterSession(null);
                  }}
                >
                  ✕
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={reports}
            rowKey="id"
            loading={loading}
            size="small"
            pagination={{ pageSize: 8, showTotal: (total) => `${total} báo cáo`, size: 'small' }}
          />
        </Col>
      </Row>

      {/* ── VIEW MODAL ── */}
      <Modal
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => viewReport && handleExport(viewReport)}
          >
            Xuất file
          </Button>,
          <Button key="close" onClick={() => setViewModalOpen(false)}>Đóng</Button>,
        ]}
        title="Chi tiết báo cáo"
        width={860}
      >
        {viewReport && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tiêu đề">{viewReport.title}</Descriptions.Item>
              <Descriptions.Item label="Ngày">
                {dayjs(viewReport.report_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Cặp giao dịch">
                {viewReport.pair
                  ? <Tag color={PAIR_COLOR[viewReport.pair] || 'default'}>{viewReport.pair}</Tag>
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Session">
                {viewReport.session
                  ? <Tag color={SESSION_COLOR[viewReport.session] || 'default'}>{viewReport.session}</Tag>
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
            <Divider>Nội dung phân tích</Divider>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.7,
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 6,
                padding: '12px 16px',
                maxHeight: 500,
                overflowY: 'auto',
                margin: 0,
              }}
            >
              {viewReport.content || 'Chưa có nội dung.'}
            </pre>
          </>
        )}
      </Modal>
    </div>
  );
}