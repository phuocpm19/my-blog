'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { TradingReport } from 'shared';
import dayjs from 'dayjs';

import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Input,
  Select,
  DatePicker,
  Pagination,
  Skeleton,
  Empty,
  Divider,
  theme,
} from 'antd';
import {
  CalendarOutlined,
  SearchOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Constants ───
const SESSION_LIST = ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];
const PAIR_LIST = ['BTC', 'ETH', 'XAU'];
const PAGE_SIZE = 9;

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
const SESSION_TEXT_COLOR: Record<string, string> = {
  'Session 1': '#1677ff',
  'Session 2': '#13c2c2',
  'Session 3': '#52c41a',
  'Session 4': '#fa8c16',
  'Session 5': '#722ed1',
};
const PAIR_COLOR: Record<string, string> = {
  BTC: 'gold', ETH: 'blue', XAU: 'green',
};

const LIST_ITEM_HEIGHT = 32;
const LIST_MAX_ITEMS = 5;
const LIST_BODY_HEIGHT = LIST_ITEM_HEIGHT * LIST_MAX_ITEMS;

// ─── RecentCard ───
function RecentCard({
  title,
  titleColor,
  borderColor,
  reports,
}: {
  title: string;
  titleColor: string;
  borderColor: string;
  reports: TradingReport[];
}) {
  const padded: (TradingReport | null)[] = [
    ...reports.slice(0, LIST_MAX_ITEMS),
    ...Array(Math.max(0, LIST_MAX_ITEMS - reports.length)).fill(null),
  ];

  return (
    <Card
      size="small"
      title={<span style={{ color: titleColor, fontWeight: 600, fontSize: 12 }}>{title}</span>}
      style={{ borderColor, borderWidth: 1.5, height: '100%' }}
      styles={{
        header: { borderBottomColor: borderColor, minHeight: 32, padding: '0 10px' },
        body: { padding: '2px 10px' },
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
              <Link
                href={`/trading-reports/${r.id}`}
                style={{
                  color: titleColor,
                  fontSize: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  display: 'block',
                }}
              >
                {r.title || `${dayjs(r.report_date).format('YYYYMMDD')} ${r.pair} ${r.session}`}
              </Link>
            ) : (
              <span style={{ color: '#d9d9d9', fontSize: 12 }}>—</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main Component ───
export default function TradingReportsClient() {
  const { token } = theme.useToken();

  // All reports for recent lists
  const [allReports, setAllReports] = useState<TradingReport[]>([]);

  // Filtered reports for list section
  const [reports, setReports] = useState<TradingReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);
  const [filterPair, setFilterPair] = useState<string | undefined>(undefined);
  const [filterSession, setFilterSession] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(true);

  // Load all for recent panels
  useEffect(() => {
    (async () => {
      setAllLoading(true);
      const { data } = await supabase
        .from('trading_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .order('created_at', { ascending: false });
      setAllReports(data || []);
      setAllLoading(false);
    })();
  }, []);

  // Load filtered for list
  const fetchReports = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('trading_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`);
    if (filterDate) query = query.eq('report_date', filterDate.format('YYYY-MM-DD'));
    if (filterPair) query = query.eq('pair', filterPair);
    if (filterSession) query = query.eq('session', filterSession);

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;
    if (data) setReports(data);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, filterDate, filterPair, filterSession]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // ─── Derived: recent panels ───
  const dateKey = (offset: number) => dayjs().subtract(offset, 'day').format('YYYY-MM-DD');
  const dateLabel = (offset: number) => {
    const d = dayjs().subtract(offset, 'day');
    return offset === 0 ? `Hôm nay — ${d.format('DD/MM/YYYY')}` : d.format('DD/MM/YYYY');
  };
  const reportsByDate = (offset: number) =>
    allReports
      .filter((r) => r.report_date === dateKey(offset))
      .sort((a, b) => SESSION_LIST.indexOf(a.session) - SESSION_LIST.indexOf(b.session));

  const recentBySession = (session: string) =>
    allReports.filter((r) => r.session === session).slice(0, LIST_MAX_ITEMS);

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          <LineChartOutlined /> Trading Reports
        </Title>
        <Text type="secondary">Tổng cộng {total} báo cáo</Text>
      </div>

      {/* ── RECENT PANELS ── */}
      <div style={{ marginBottom: 32 }}>
        <Title level={5} style={{ marginBottom: 12, color: token.colorTextSecondary, fontWeight: 500 }}>
          Báo cáo gần đây
        </Title>

        {/* Hàng 1: 3 ngày — cùng độ rộng với 5 session */}
        <Row gutter={[12, 12]} style={{ marginBottom: 8 }}>
          {[0, 1, 2].map((offset) => (
            <Col key={offset} style={{ flex: '0 0 20%', maxWidth: '20%' }}>
              <RecentCard
                title={dateLabel(offset)}
                titleColor="#595959"
                borderColor="#d9d9d9"
                reports={reportsByDate(offset)}
              />
            </Col>
          ))}
        </Row>

        {/* Hàng 2: 5 sessions */}
        <Row gutter={[12, 12]}>
          {SESSION_LIST.map((ss) => (
            <Col xs={12} sm={12} md={24 / 5} key={ss} style={{ flex: '0 0 20%', maxWidth: '20%' }}>
              <RecentCard
                title={ss}
                titleColor={SESSION_TEXT_COLOR[ss]}
                borderColor={SESSION_BORDER[ss]}
                reports={recentBySession(ss)}
              />
            </Col>
          ))}
        </Row>
      </div>

      <Divider />

      {/* ── FILTERS ── */}
      <Title level={5} style={{ marginBottom: 12, color: token.colorTextSecondary, fontWeight: 500 }}>
        Tất cả báo cáo
      </Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm kiếm báo cáo..."
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Lọc theo ngày"
            format="DD/MM/YYYY"
            onChange={(val) => { setFilterDate(val); setPage(1); }}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="Cặp"
            allowClear
            onChange={(val) => { setFilterPair(val); setPage(1); }}
          >
            {PAIR_LIST.map((p) => <Option key={p} value={p}>{p}</Option>)}
          </Select>
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Select
            style={{ width: '100%' }}
            placeholder="Session"
            allowClear
            onChange={(val) => { setFilterSession(val); setPage(1); }}
          >
            {SESSION_LIST.map((s) => <Option key={s} value={s}>{s}</Option>)}
          </Select>
        </Col>
      </Row>

      {/* ── ALL REPORTS GRID ── */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card><Skeleton active paragraph={{ rows: 2 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : reports.length === 0 ? (
        <Empty
          description={search || filterDate || filterPair || filterSession
            ? 'Không tìm thấy báo cáo nào'
            : 'Chưa có báo cáo nào'}
          style={{ padding: '48px 0' }}
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {reports.map((report) => (
              <Col xs={24} sm={12} md={8} key={report.id}>
                <Link href={`/trading-reports/${report.id}`} style={{ display: 'block', height: '100%' }}>
                  <Card hoverable style={{ height: '100%' }}>
                    <div style={{ marginBottom: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined />{' '}
                        {new Date(report.report_date).toLocaleDateString('vi-VN')}
                      </Text>
                      {report.pair && (
                        <Tag color={PAIR_COLOR[report.pair] || 'default'} style={{ margin: 0 }}>
                          {report.pair}
                        </Tag>
                      )}
                      {report.session && (
                        <Tag color={SESSION_COLOR[report.session] || 'default'} style={{ margin: 0 }}>
                          {report.session}
                        </Tag>
                      )}
                    </div>
                    <Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>
                      {report.title}
                    </Title>
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