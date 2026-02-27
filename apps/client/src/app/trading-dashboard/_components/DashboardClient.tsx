'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Trade } from 'shared';

import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Skeleton,
  Empty,
  Space,
  Segmented,
  theme,
} from 'antd';
import {
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  FireOutlined,
  ThunderboltOutlined,
  FundOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const sessionColors: Record<string, string> = {
  SS1: 'blue',
  SS2: 'cyan',
  SS3: 'green',
  SS4: 'orange',
  SS5: 'volcano',
  SS6: 'purple',
};

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function DashboardClient() {
  const { token } = theme.useToken();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    async function fetchTrades() {
      setLoading(true);

      let query = supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: true });

      // Time range filter
      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const since = new Date();
        since.setDate(since.getDate() - days);
        query = query.gte('trade_date', since.toISOString());
      }

      const { data } = await query;
      if (data) setTrades(data);
      setLoading(false);
    }

    fetchTrades();
  }, [timeRange]);

  if (loading) {
    return (
      <>
        <Title level={2}><FundOutlined /> Trading Dashboard</Title>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={12} sm={6} key={i}>
              <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
      </>
    );
  }

  if (trades.length === 0) {
    return (
      <>
        <Title level={2}><FundOutlined /> Trading Dashboard</Title>
        <Empty description="Chưa có dữ liệu giao dịch" style={{ padding: '64px 0' }} />
      </>
    );
  }

  // === Calculate Stats ===
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalFees = trades.reduce((sum, t) => sum + (t.fee || 0), 0);
  const netPnl = totalPnl - totalFees;
  const winTrades = trades.filter((t) => t.pnl > 0);
  const lossTrades = trades.filter((t) => t.pnl < 0);
  const winRate = (winTrades.length / trades.length) * 100;
  const avgWin = winTrades.length > 0 ? winTrades.reduce((s, t) => s + t.pnl, 0) / winTrades.length : 0;
  const avgLoss = lossTrades.length > 0 ? Math.abs(lossTrades.reduce((s, t) => s + t.pnl, 0) / lossTrades.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
  const bestTrade = trades.reduce((best, t) => (t.pnl > best.pnl ? t : best), trades[0]);
  const worstTrade = trades.reduce((worst, t) => (t.pnl < worst.pnl ? t : worst), trades[0]);

  // Pair breakdown
  const pairMap: Record<string, { pnl: number; count: number; wins: number }> = {};
  trades.forEach((t) => {
    if (!pairMap[t.pair]) pairMap[t.pair] = { pnl: 0, count: 0, wins: 0 };
    pairMap[t.pair].pnl += t.pnl || 0;
    pairMap[t.pair].count += 1;
    if (t.pnl > 0) pairMap[t.pair].wins += 1;
  });
  const pairData = Object.entries(pairMap)
    .map(([pair, data]) => ({
      pair,
      ...data,
      winRate: ((data.wins / data.count) * 100).toFixed(1),
    }))
    .sort((a, b) => b.pnl - a.pnl);

  // Session breakdown
  const sessionMap: Record<string, { pnl: number; count: number; wins: number }> = {};
  trades.forEach((t) => {
    // Try to get session from report, or group by time
    const session = 'All'; // Default if no session info
    if (!sessionMap[session]) sessionMap[session] = { pnl: 0, count: 0, wins: 0 };
    sessionMap[session].pnl += t.pnl || 0;
    sessionMap[session].count += 1;
    if (t.pnl > 0) sessionMap[session].wins += 1;
  });

  // Side breakdown
  const longTrades = trades.filter((t) => t.side === 'long');
  const shortTrades = trades.filter((t) => t.side === 'short');
  const longPnl = longTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const shortPnl = shortTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const longWinRate = longTrades.length > 0
    ? ((longTrades.filter((t) => t.pnl > 0).length / longTrades.length) * 100).toFixed(1)
    : '0';
  const shortWinRate = shortTrades.length > 0
    ? ((shortTrades.filter((t) => t.pnl > 0).length / shortTrades.length) * 100).toFixed(1)
    : '0';

  // Daily PnL for cumulative chart (simple text-based)
  const dailyPnl: Record<string, number> = {};
  trades.forEach((t) => {
    const date = t.trade_date?.split('T')[0] || 'unknown';
    dailyPnl[date] = (dailyPnl[date] || 0) + (t.pnl || 0);
  });
  const dailyEntries = Object.entries(dailyPnl).sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;
  const cumulativeData = dailyEntries.map(([date, pnl]) => {
    cumulative += pnl;
    return { date, pnl, cumulative };
  });

  // Recent trades
  const recentTrades = [...trades].sort((a, b) =>
    new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
  ).slice(0, 10);

  const pairColumns = [
    { title: 'Pair', dataIndex: 'pair', key: 'pair', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Trades', dataIndex: 'count', key: 'count', width: 80 },
    {
      title: 'Win Rate',
      dataIndex: 'winRate',
      key: 'winRate',
      width: 120,
      render: (v: string) => (
        <Progress
          percent={Number(v)}
          size="small"
          strokeColor={Number(v) >= 50 ? token.colorSuccess : token.colorError}
          format={(p) => `${p}%`}
        />
      ),
    },
    {
      title: 'PnL',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 140,
      render: (pnl: number) => (
        <Text strong style={{ color: pnl >= 0 ? token.colorSuccess : token.colorError }}>
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
        </Text>
      ),
    },
  ];

  const recentColumns = [
    {
      title: 'Date',
      dataIndex: 'trade_date',
      key: 'trade_date',
      width: 100,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
    },
    { title: 'Pair', dataIndex: 'pair', key: 'pair', width: 100 },
    {
      title: 'Side',
      dataIndex: 'side',
      key: 'side',
      width: 80,
      render: (side: string) => (
        <Tag color={side === 'long' ? 'green' : 'red'}>
          {side === 'long' ? <RiseOutlined /> : <FallOutlined />} {side.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Leverage',
      dataIndex: 'leverage',
      key: 'leverage',
      width: 80,
      render: (v: number) => `${v}x`,
    },
    {
      title: 'PnL',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 120,
      render: (pnl: number) => (
        <Text strong style={{ color: pnl >= 0 ? token.colorSuccess : token.colorError }}>
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Strategy',
      dataIndex: 'strategy',
      key: 'strategy',
      width: 120,
      render: (v: string | null) => v || '—',
    },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <FundOutlined /> Trading Dashboard
        </Title>
        <Segmented
          value={timeRange}
          onChange={(v) => setTimeRange(v as TimeRange)}
          options={[
            { label: '7 ngày', value: '7d' },
            { label: '30 ngày', value: '30d' },
            { label: '90 ngày', value: '90d' },
            { label: 'Tất cả', value: 'all' },
          ]}
        />
      </div>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng PnL"
              value={netPnl}
              precision={2}
              suffix="USDT"
              valueStyle={{ color: netPnl >= 0 ? token.colorSuccess : token.colorError }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Win Rate"
              value={winRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: winRate >= 50 ? token.colorSuccess : token.colorError }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng lệnh"
              value={trades.length}
              prefix={<BarChartOutlined />}
            />
            <Space style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <Text style={{ color: token.colorSuccess, fontSize: 12 }}>{winTrades.length}W</Text>
                {' / '}
                <Text style={{ color: token.colorError, fontSize: 12 }}>{lossTrades.length}L</Text>
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Profit Factor"
              value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: profitFactor >= 1 ? token.colorSuccess : token.colorError }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Avg Win"
              value={avgWin}
              precision={2}
              suffix="USDT"
              valueStyle={{ color: token.colorSuccess, fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Avg Loss"
              value={avgLoss}
              precision={2}
              suffix="USDT"
              valueStyle={{ color: token.colorError, fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Best Trade"
              value={bestTrade.pnl}
              precision={2}
              suffix="USDT"
              valueStyle={{ color: token.colorSuccess, fontSize: 16 }}
              prefix={<FireOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>{bestTrade.pair}</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Worst Trade"
              value={worstTrade.pnl}
              precision={2}
              suffix="USDT"
              valueStyle={{ color: token.colorError, fontSize: 16 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>{worstTrade.pair}</Text>
          </Card>
        </Col>
      </Row>

      {/* Long vs Short */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card title={<><RiseOutlined style={{ color: token.colorSuccess }} /> Long Performance</>} size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Trades" value={longTrades.length} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col span={8}>
                <Statistic title="Win Rate" value={longWinRate} suffix="%" valueStyle={{ fontSize: 16, color: Number(longWinRate) >= 50 ? token.colorSuccess : token.colorError }} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="PnL"
                  value={longPnl}
                  precision={2}
                  valueStyle={{ fontSize: 16, color: longPnl >= 0 ? token.colorSuccess : token.colorError }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title={<><FallOutlined style={{ color: token.colorError }} /> Short Performance</>} size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Trades" value={shortTrades.length} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col span={8}>
                <Statistic title="Win Rate" value={shortWinRate} suffix="%" valueStyle={{ fontSize: 16, color: Number(shortWinRate) >= 50 ? token.colorSuccess : token.colorError }} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="PnL"
                  value={shortPnl}
                  precision={2}
                  valueStyle={{ fontSize: 16, color: shortPnl >= 0 ? token.colorSuccess : token.colorError }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Cumulative PnL (simple visual) */}
      {cumulativeData.length > 1 && (
        <Card title="Cumulative PnL" style={{ marginBottom: 24 }} size="small">
          <div style={{ display: 'flex', alignItems: 'end', gap: 2, height: 120, padding: '0 4px' }}>
            {cumulativeData.map((d, i) => {
              const maxAbs = Math.max(...cumulativeData.map((c) => Math.abs(c.cumulative)), 1);
              const height = Math.abs(d.cumulative) / maxAbs * 100;
              return (
                <div
                  key={i}
                  title={`${d.date}: ${d.cumulative >= 0 ? '+' : ''}${d.cumulative.toFixed(2)} USDT`}
                  style={{
                    flex: 1,
                    maxWidth: 24,
                    height: `${Math.max(height, 4)}%`,
                    background: d.cumulative >= 0 ? token.colorSuccess : token.colorError,
                    borderRadius: '2px 2px 0 0',
                    opacity: 0.8,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.8'; }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>{cumulativeData[0]?.date}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{cumulativeData[cumulativeData.length - 1]?.date}</Text>
          </div>
        </Card>
      )}

      {/* Pair Breakdown */}
      <Card title="Performance theo Pair" style={{ marginBottom: 24 }} size="small">
        <Table
          dataSource={pairData}
          columns={pairColumns}
          rowKey="pair"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Recent Trades */}
      <Card title="Giao dịch gần đây" size="small">
        <Table
          dataSource={recentTrades}
          columns={recentColumns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 600 }}
          size="small"
        />
      </Card>
    </>
  );
}
