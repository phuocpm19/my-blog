'use client';

import { useEffect, useState, useCallback } from 'react';
import { Typography, Card, Row, Col, Select, Tag, Spin, Button, DatePicker, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { supabase } from '@/lib/supabase';

dayjs.extend(isoWeek);

const { Title, Text } = Typography;
const { Option } = Select;

interface Trade {
  id: string;
  trade_date: string;
  platform: string | null;
  account_name: string | null;
  pnl: number;
  fee: number;
  swap: number | null;
  result_recorded: number | null;
  result_actual: number | null;
}

interface ChartPoint { date: string; cumulative: number; value: number; }

interface Stats {
  totalTrades: number; winTrades: number; lossTrades: number;
  totalWin: number; totalLoss: number; avgWin: number; avgLoss: number;
  maxWinStreak: number; maxLossStreak: number; winRate: number;
  rr: string; avgPerTrade: number; totalPnl: number;
  totalCost: number; totalRecorded: number; totalActual: number;
}

function calcStats(trades: Trade[]): Stats {
  const sorted = [...trades].sort((a, b) => dayjs(a.trade_date).unix() - dayjs(b.trade_date).unix());
  const results = sorted.map((t) => ({ ...t, net: (t.pnl || 0) + (t.fee || 0) + (t.swap || 0) }));
  const wins = results.filter((t) => t.net > 0);
  const losses = results.filter((t) => t.net < 0);
  const totalWin = wins.reduce((s, t) => s + t.net, 0);
  const totalLoss = losses.reduce((s, t) => s + t.net, 0);
  let maxWin = 0, maxLoss = 0, curWin = 0, curLoss = 0;
  for (const t of results) {
    if (t.net > 0) { curWin++; curLoss = 0; maxWin = Math.max(maxWin, curWin); }
    else if (t.net < 0) { curLoss++; curWin = 0; maxLoss = Math.max(maxLoss, curLoss); }
    else { curWin = 0; curLoss = 0; }
  }
  const totalPnl = results.reduce((s, t) => s + (t.pnl || 0), 0);
  const totalCost = results.reduce((s, t) => s + (t.fee || 0) + (t.swap || 0), 0);
  const totalRecorded = results.reduce((s, t) => s + (t.result_recorded || 0), 0);
  const totalActual = results.reduce((s, t) => s + (t.result_actual || 0), 0);
  const avgWinVal = wins.length > 0 ? totalWin / wins.length : 0;
  const avgLossVal = losses.length > 0 ? Math.abs(totalLoss / losses.length) : 0;
  const rr = avgLossVal > 0 && avgWinVal > 0 ? `1 : ${(avgWinVal / avgLossVal).toFixed(2)}` : '—';
  return {
    totalTrades: results.length, winTrades: wins.length, lossTrades: losses.length,
    totalWin, totalLoss,
    avgWin: wins.length > 0 ? totalWin / wins.length : 0,
    avgLoss: losses.length > 0 ? totalLoss / losses.length : 0,
    maxWinStreak: maxWin, maxLossStreak: maxLoss,
    winRate: results.length > 0 ? (wins.length / results.length) * 100 : 0,
    rr, avgPerTrade: results.length > 0 ? totalRecorded / results.length : 0,
    totalPnl, totalCost, totalRecorded, totalActual,
  };
}

function buildChartData(trades: Trade[]): ChartPoint[] {
  const sorted = [...trades].sort((a, b) => dayjs(a.trade_date).unix() - dayjs(b.trade_date).unix());
  let cumulative = 0;
  return sorted.map((t) => {
    const value = t.result_recorded || 0;
    cumulative += value;
    return { date: dayjs(t.trade_date).format('DD/MM'), value, cumulative: Math.round(cumulative * 100) / 100 };
  });
}

function fmt(n: number) {
  return (n >= 0 ? '+' : '') + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function fmtAbs(n: number) {
  const abs = Math.abs(n);
  const s = abs.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return n < 0 ? `-$${s}` : `$${s}`;
}

function StatCard({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--ant-color-border-secondary)' }}>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</Text>
      <Text strong style={{ fontSize: 16, color }}>{value}</Text>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{ background: 'var(--ant-color-bg-container)', border: '1px solid var(--ant-color-border-secondary)', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
      <div style={{ color: 'var(--ant-color-text-secondary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, color: val >= 0 ? '#13c2c2' : '#ff4d4f' }}>{fmt(val)}</div>
    </div>
  );
}

// ─── Calendar ───
function TradeCalendar({ trades, calendarMonth, onMonthChange }: {
  trades: Trade[];
  calendarMonth: Dayjs;
  onMonthChange: (d: Dayjs) => void;
}) {
  const today = dayjs();
  const startOfMonth = calendarMonth.startOf('month');
  const daysInMonth = calendarMonth.daysInMonth();

  // Group trades by date string YYYY-MM-DD
  const byDate: Record<string, { pnl: number; count: number }> = {};
  for (const t of trades) {
    const key = dayjs(t.trade_date).format('YYYY-MM-DD');
    if (!byDate[key]) byDate[key] = { pnl: 0, count: 0 };
    byDate[key].pnl += t.result_recorded || 0;
    byDate[key].count += 1;
  }

  // Monthly stats
  const monthTrades = Object.values(byDate);
  const monthPnl = monthTrades.reduce((s, d) => s + d.pnl, 0);
  const tradeDays = monthTrades.length;

  // Build calendar grid — start from Monday
  const firstDow = startOfMonth.day(); // 0=Sun,1=Mon...
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <Card style={{ marginTop: 24 }} styles={{ body: { padding: 0 } }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--ant-color-border-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button size="small" onClick={() => onMonthChange(dayjs())}>Hôm nay</Button>
          <Button size="small" icon={<LeftOutlined />} onClick={() => onMonthChange(calendarMonth.subtract(1, 'month'))} />
          <Text strong style={{ fontSize: 16, minWidth: 140, textAlign: 'center' }}>
            {calendarMonth.format('MMMM YYYY').replace(/^\w/, (c) => c.toUpperCase())}
          </Text>
          <Button size="small" icon={<RightOutlined />} onClick={() => onMonthChange(calendarMonth.add(1, 'month'))} />
        </div>
        <Space size={16}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Số liệu thống kê hàng tháng:{' '}
            <Text strong style={{ color: monthPnl >= 0 ? '#13c2c2' : '#ff4d4f' }}>{fmtAbs(monthPnl)}</Text>
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Ngày giao dịch: <Text strong>{tradeDays}</Text>
          </Text>
        </Space>
      </div>

      {/* DOW headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--ant-color-border-secondary)' }}>
        {DOW.map((d) => (
          <div key={d} style={{ padding: '8px 12px', fontSize: 13, color: 'var(--ant-color-text-secondary)', fontWeight: 500 }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => {
          const dateKey = day ? calendarMonth.date(day).format('YYYY-MM-DD') : null;
          const data = dateKey ? byDate[dateKey] : null;
          const isToday = day && calendarMonth.date(day).isSame(today, 'day');
          const isCurrentMonth = !!day;
          const pnlColor = data ? (data.pnl >= 0 ? '#13c2c2' : '#ff4d4f') : undefined;
          const bgColor = data ? (data.pnl >= 0 ? '#e6fffb' : '#fff1f0') : 'transparent';

          return (
            <div
              key={i}
              style={{
                minHeight: 90,
                padding: '8px 12px',
                borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--ant-color-border-secondary)' : 'none',
                borderBottom: i < cells.length - 7 ? '1px solid var(--ant-color-border-secondary)' : 'none',
                background: isCurrentMonth ? 'var(--ant-color-bg-container)' : 'var(--ant-color-bg-layout)',
              }}
            >
              {day && (
                <>
                  <div style={{ marginBottom: 8 }}>
                    {isToday ? (
                      <span style={{ background: '#1677ff', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{day}</span>
                    ) : (
                      <Text style={{ fontSize: 13, color: isCurrentMonth ? 'var(--ant-color-text)' : 'var(--ant-color-text-quaternary)' }}>{day}</Text>
                    )}
                  </div>
                  {data && (
                    <div style={{ background: bgColor, borderRadius: 6, padding: '6px 8px' }}>
                      <Text strong style={{ fontSize: 14, color: pnlColor, display: 'block' }}>
                        {fmtAbs(data.pnl)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Các giao dịch: {data.count}
                      </Text>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function StatisticsPage() {
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'amount' | 'percent'>('amount');
  const [calendarMonth, setCalendarMonth] = useState(dayjs());

  // ─── Filters ───
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [filterAccount, setFilterAccount] = useState<string | null>(null);
  const [filterFrom, setFilterFrom] = useState<Dayjs | null>(null);
  const [filterTo, setFilterTo] = useState<Dayjs | null>(null);
  const [accounts, setAccounts] = useState<{ name: string }[]>([]);

  const loadTrades = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('id, trade_date, platform, account_name, pnl, fee, swap, result_recorded, result_actual')
      .order('trade_date', { ascending: true });
    if (!error) {
      setAllTrades(data || []);
      // Derive unique accounts
      const names = [...new Set((data || []).map((t: Trade) => t.account_name).filter(Boolean))];
      setAccounts(names.map((n) => ({ name: n as string })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTrades(); }, [loadTrades]);

  // Apply filters
  const trades = allTrades.filter((t) => {
    if (filterPlatform && t.platform !== filterPlatform) return false;
    if (filterAccount && t.account_name !== filterAccount) return false;
    if (filterFrom && dayjs(t.trade_date) < filterFrom.startOf('day')) return false;
    if (filterTo && dayjs(t.trade_date) > filterTo.endOf('day')) return false;
    return true;
  });

  const setTimePreset = (preset: 'year' | 'month' | 'week') => {
    const now = dayjs();
    if (preset === 'year') { setFilterFrom(now.startOf('year')); setFilterTo(now.endOf('year')); }
    if (preset === 'month') { setFilterFrom(now.startOf('month')); setFilterTo(now.endOf('month')); }
    if (preset === 'week') { setFilterFrom(now.startOf('isoWeek')); setFilterTo(now.endOf('isoWeek')); }
  };

  const stats = calcStats(trades);
  const chartData = buildChartData(trades);
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map((d) => d.cumulative), 0) : 0;
  const minVal = chartData.length > 0 ? Math.min(...chartData.map((d) => d.cumulative), 0) : 0;
  const range = maxVal - minVal || 1;
  const zeroPercent = maxVal / range;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Thống kê giao dịch</Title>
        <Text type="secondary">{stats.totalTrades} giao dịch</Text>
      </div>

      {/* ─── Filters ─── */}
      <Card size="small" style={{ marginBottom: 20 }} styles={{ body: { padding: '12px 16px' } }}>
        <Row gutter={[12, 8]} align="middle">
          <Col xs={12} md={4}>
            <Select style={{ width: '100%' }} placeholder="Nền tảng" allowClear value={filterPlatform}
              onChange={(v) => setFilterPlatform(v ?? null)}>
              <Option value="Exness">Exness</Option>
              <Option value="FTMO">FTMO</Option>
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Select style={{ width: '100%' }} placeholder="Tên tài khoản" allowClear showSearch
              value={filterAccount} onChange={(v) => setFilterAccount(v ?? null)}>
              {accounts.map((a) => <Option key={a.name} value={a.name}>{a.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={15}>
            <Row gutter={8} align="middle">
              <Col>
                <Button type={filterFrom?.isSame(dayjs().startOf('year'), 'day') ? 'primary' : 'default'}
                  onClick={() => setTimePreset('year')}>Năm hiện tại</Button>
              </Col>
              <Col>
                <Button type={filterFrom?.isSame(dayjs().startOf('month'), 'day') ? 'primary' : 'default'}
                  onClick={() => setTimePreset('month')}>Tháng hiện tại</Button>
              </Col>
              <Col>
                <Button type={filterFrom?.isSame(dayjs().startOf('isoWeek'), 'day') ? 'primary' : 'default'}
                  onClick={() => setTimePreset('week')}>Tuần hiện tại</Button>
              </Col>
              <Col>
                <DatePicker placeholder="Từ ngày" format="DD/MM/YYYY"
                  value={filterFrom} onChange={(v) => setFilterFrom(v)} />
              </Col>
              <Col>
                <DatePicker placeholder="Đến ngày" format="DD/MM/YYYY"
                  value={filterTo} onChange={(v) => setFilterTo(v)} />
              </Col>
              <Col>
                <Button onClick={() => { setFilterPlatform(null); setFilterAccount(null); setFilterFrom(null); setFilterTo(null); }}>✕</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* ─── Chart ─── */}
      <Card style={{ marginBottom: 24 }} styles={{ body: { padding: '20px 16px 8px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text strong>Lợi nhuận tích lũy</Text>
          <Select value={chartMode} onChange={(v) => setChartMode(v)} size="small" style={{ width: 140 }}>
            <Option value="amount">Số tiền</Option>
            <Option value="percent">Tỷ lệ %</Option>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSplit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#13c2c2" stopOpacity={0.3} />
                <stop offset={`${zeroPercent * 100}%`} stopColor="#13c2c2" stopOpacity={0.05} />
                <stop offset={`${zeroPercent * 100}%`} stopColor="#ff4d4f" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#ff4d4f" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="strokeSplit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#13c2c2" />
                <stop offset={`${zeroPercent * 100 - 0.1}%`} stopColor="#13c2c2" />
                <stop offset={`${zeroPercent * 100 + 0.1}%`} stopColor="#ff4d4f" />
                <stop offset="100%" stopColor="#ff4d4f" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ant-color-border-secondary)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ant-color-text-quaternary)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--ant-color-text-quaternary)' }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString('en-US')} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="var(--ant-color-border)" strokeWidth={1.5} strokeDasharray="4 2" />
            <Area type="monotone" dataKey="cumulative" stroke="url(#strokeSplit)" strokeWidth={2} fill="url(#gradSplit)" dot={false} activeDot={{ r: 4, fill: '#13c2c2', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ─── Stats 4 columns ─── */}
      <Row gutter={16}>
        <Col xs={24} sm={12} xl={6}>
          <Card size="small" title={<span style={{ color: '#ff4d4f', fontWeight: 600 }}>Giao dịch lỗ</span>}
            styles={{ header: { borderBottomColor: '#ff4d4f33' } }} style={{ borderColor: '#ff4d4f33' }}>
            <StatCard label="Số GD lỗ" value={stats.lossTrades} color="#ff4d4f" />
            <StatCard label="Tổng tiền lỗ" value={fmt(stats.totalLoss)} color="#ff4d4f" />
            <StatCard label="Trung bình lỗ / GD" value={fmt(stats.avgLoss)} color="#ff4d4f" />
            <StatCard label="Chuỗi lỗ dài nhất" value={<span>{stats.maxLossStreak} <Text type="secondary" style={{ fontSize: 12 }}>GD liên tiếp</Text></span>} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card size="small" title={<span style={{ color: '#13c2c2', fontWeight: 600 }}>Giao dịch lãi</span>}
            styles={{ header: { borderBottomColor: '#13c2c233' } }} style={{ borderColor: '#13c2c233' }}>
            <StatCard label="Số GD lãi" value={stats.winTrades} color="#13c2c2" />
            <StatCard label="Tổng tiền lãi" value={fmt(stats.totalWin)} color="#13c2c2" />
            <StatCard label="Trung bình lãi / GD" value={fmt(stats.avgWin)} color="#13c2c2" />
            <StatCard label="Chuỗi lãi dài nhất" value={<span>{stats.maxWinStreak} <Text type="secondary" style={{ fontSize: 12 }}>GD liên tiếp</Text></span>} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card size="small" title={<span style={{ fontWeight: 600 }}>Tổng quan</span>}>
            <StatCard label="Tổng số GD" value={stats.totalTrades} />
            <StatCard label="Kết quả TB / GD" value={fmt(stats.avgPerTrade)} color={stats.avgPerTrade >= 0 ? '#13c2c2' : '#ff4d4f'} />
            <StatCard label="Win rate" value={<span>{stats.winRate.toFixed(1)}%{' '}<Tag color={stats.winRate >= 50 ? 'cyan' : 'red'} style={{ fontSize: 11 }}>{stats.winTrades}W / {stats.lossTrades}L</Tag></span>} color={stats.winRate >= 50 ? '#13c2c2' : '#ff4d4f'} />
            <StatCard label="Risk / Reward" value={stats.rr} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card size="small" title={<span style={{ fontWeight: 600 }}>Kết quả tài chính</span>}>
            <StatCard label="PnL ghi nhận" value={fmt(stats.totalPnl)} color={stats.totalPnl >= 0 ? '#13c2c2' : '#ff4d4f'} />
            <StatCard label="Chi phí (Phí GD + Phí ĐM)" value={fmt(stats.totalCost)} color="#fa8c16" />
            <StatCard label="Kết quả ghi nhận" value={fmt(stats.totalRecorded)} color={stats.totalRecorded >= 0 ? '#13c2c2' : '#ff4d4f'} />
            <StatCard label="Kết quả thực tế" value={fmt(stats.totalActual)} color={stats.totalActual >= 0 ? '#13c2c2' : '#ff4d4f'} />
          </Card>
        </Col>
      </Row>

      {/* ─── Calendar ─── */}
      <TradeCalendar
        trades={trades}
        calendarMonth={calendarMonth}
        onMonthChange={setCalendarMonth}
      />
    </>
  );
}