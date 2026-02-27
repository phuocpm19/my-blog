'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, Row, Col, Statistic, Table, Tag, Space, Skeleton, theme } from 'antd';
import {
  AppstoreOutlined,
  TagsOutlined,
  FileTextOutlined,
  LineChartOutlined,
  SwapOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { supabase } from '@/lib/supabase';

const { Title, Text } = Typography;

interface DashboardStats {
  categories: number;
  tags: number;
  posts: number;
  publishedPosts: number;
  reports: number;
  trades: number;
}

export default function DashboardPage() {
  const { token } = theme.useToken();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    tags: 0,
    posts: 0,
    publishedPosts: 0,
    reports: 0,
    trades: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const [catCount, tagCount, postCount, pubPostCount, reportCount, tradeCount, posts, trades] =
        await Promise.all([
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('tags').select('*', { count: 'exact', head: true }),
          supabase.from('posts').select('*', { count: 'exact', head: true }),
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('trading_reports').select('*', { count: 'exact', head: true }),
          supabase.from('trades').select('*', { count: 'exact', head: true }),
          supabase
            .from('posts')
            .select('id, title, status, created_at, category:categories(name)')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('trades')
            .select('id, pair, side, pnl, pnl_percent, trade_date')
            .order('trade_date', { ascending: false })
            .limit(5),
        ]);

      setStats({
        categories: catCount.count ?? 0,
        tags: tagCount.count ?? 0,
        posts: postCount.count ?? 0,
        publishedPosts: pubPostCount.count ?? 0,
        reports: reportCount.count ?? 0,
        trades: tradeCount.count ?? 0,
      });

      if (posts.data) setRecentPosts(posts.data);
      if (trades.data) setRecentTrades(trades.data);

      setLoading(false);
    }

    loadDashboard();
  }, []);

  const statCards = [
    { title: 'Categories', value: stats.categories, icon: <AppstoreOutlined />, color: '#1677ff', link: '/categories' },
    { title: 'Tags', value: stats.tags, icon: <TagsOutlined />, color: '#722ed1', link: '/tags' },
    { title: 'Bài viết', value: stats.posts, icon: <FileTextOutlined />, color: '#52c41a', link: '/posts', suffix: `(${stats.publishedPosts} published)` },
    { title: 'Trading Reports', value: stats.reports, icon: <LineChartOutlined />, color: '#fa8c16', link: '/trading-reports' },
    { title: 'Giao dịch', value: stats.trades, icon: <SwapOutlined />, color: '#eb2f96', link: '/trades' },
  ];

  const postColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (cat: any) => cat?.name || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  const tradeColumns = [
    {
      title: 'Pair',
      dataIndex: 'pair',
      key: 'pair',
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
      title: 'PnL',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 120,
      render: (pnl: number) => (
        <Text strong style={{ color: pnl >= 0 ? token.colorSuccess : token.colorError }}>
          {pnl >= 0 ? '+' : ''}{pnl?.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'trade_date',
      key: 'trade_date',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard</Title>

      {/* Stats Cards */}
      {loading ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Col xs={24} sm={12} md={8} lg={4} key={i}>
              <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statCards.map((card) => (
            <Col xs={24} sm={12} md={8} lg={4} key={card.title}>
              <Card
                hoverable
                onClick={() => router.push(card.link)}
                style={{ cursor: 'pointer' }}
              >
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                />
                {card.suffix && (
                  <Text type="secondary" style={{ fontSize: 12 }}>{card.suffix}</Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Recent Data */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Bài viết gần đây" size="small">
            <Table
              dataSource={recentPosts}
              columns={postColumns}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có bài viết' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Giao dịch gần đây" size="small">
            <Table
              dataSource={recentTrades}
              columns={tradeColumns}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có giao dịch' }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
