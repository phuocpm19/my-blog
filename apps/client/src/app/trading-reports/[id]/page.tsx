'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { TradingReport, Trade } from 'shared';

import {
  Typography,
  Tag,
  Space,
  Skeleton,
  Button,
  Divider,
  Table,
  Card,
  Statistic,
  Row,
  Col,
  theme,
} from 'antd';
import {
  CalendarOutlined,
  ArrowLeftOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const sessionColors: Record<string, string> = {
  SS1: 'blue',
  SS2: 'cyan',
  SS3: 'green',
  SS4: 'orange',
  SS5: 'volcano',
  SS6: 'purple',
};

export default function TradingReportDetailPage() {
  const { token } = theme.useToken();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<TradingReport | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);

      const { data: reportData, error } = await supabase
        .from('trading_reports')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error || !reportData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setReport(reportData);

      // Fetch trades for this report
      const { data: tradesData } = await supabase
        .from('trades')
        .select('*')
        .eq('report_id', id)
        .order('trade_date', { ascending: true });

      if (tradesData) setTrades(tradesData);

      setLoading(false);
    }

    if (id) fetchReport();
  }, [id]);

  // Calculate summary stats
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winCount = trades.filter((t) => t.pnl > 0).length;
  const lossCount = trades.filter((t) => t.pnl < 0).length;
  const winRate = trades.length > 0 ? ((winCount / trades.length) * 100).toFixed(1) : '0';

  const tradeColumns = [
    {
      title: 'Pair',
      dataIndex: 'pair',
      key: 'pair',
      width: 120,
      render: (pair: string) => <Text strong>{pair}</Text>,
    },
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
      title: 'Entry',
      dataIndex: 'entry_price',
      key: 'entry_price',
      width: 100,
      render: (v: number) => v?.toLocaleString(),
    },
    {
      title: 'Exit',
      dataIndex: 'exit_price',
      key: 'exit_price',
      width: 100,
      render: (v: number) => v?.toLocaleString(),
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
          {pnl >= 0 ? '+' : ''}{pnl?.toFixed(2)} USDT
        </Text>
      ),
    },
    {
      title: 'PnL %',
      dataIndex: 'pnl_percent',
      key: 'pnl_percent',
      width: 90,
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? token.colorSuccess : token.colorError }}>
          {v >= 0 ? '+' : ''}{v?.toFixed(2)}%
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

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} />
        <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: 24 }} />
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <Title level={3}>Không tìm thấy báo cáo</Title>
        <Paragraph type="secondary">
          Báo cáo này không tồn tại hoặc chưa được xuất bản.
        </Paragraph>
        <Button type="primary" onClick={() => router.push('/trading-reports')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Back button */}
      <Link href="/trading-reports">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ marginBottom: 16, paddingLeft: 0 }}
        >
          Quay lại danh sách
        </Button>
      </Link>

      {/* Report Header */}
      <article>
        <Title level={1} style={{ marginBottom: 12 }}>
          {report.title}
        </Title>

        <Space size="middle" style={{ marginBottom: 24 }}>
          <Tag color={sessionColors[report.session] || 'default'} style={{ fontSize: 14, padding: '2px 12px' }}>
            {report.session}
          </Tag>
          <Text type="secondary">
            <CalendarOutlined />{' '}
            {new Date(report.report_date).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Space>

        <Divider />

        {/* Content */}
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: report.content }}
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: token.colorText,
          }}
        />
      </article>

      {/* Trades Section */}
      {trades.length > 0 && (
        <>
          <Divider />
          <Title level={3}>Giao dịch trong phiên</Title>

          {/* Summary Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tổng PnL"
                  value={totalPnl}
                  precision={2}
                  suffix="USDT"
                  valueStyle={{ color: totalPnl >= 0 ? token.colorSuccess : token.colorError }}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Win Rate"
                  value={Number(winRate)}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: Number(winRate) >= 50 ? token.colorSuccess : token.colorError }}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic title="Thắng" value={winCount} valueStyle={{ color: token.colorSuccess }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic title="Thua" value={lossCount} valueStyle={{ color: token.colorError }} />
              </Card>
            </Col>
          </Row>

          {/* Trades Table */}
          <Table
            dataSource={trades}
            columns={tradeColumns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
            size="small"
          />
        </>
      )}
    </div>
  );
}
