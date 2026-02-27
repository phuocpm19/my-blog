'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Post, TradingReport } from 'shared';

import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Skeleton,
  Empty,
  Button,
  theme,
} from 'antd';
import {
  BookOutlined,
  LineChartOutlined,
  BarChartOutlined,
  ReadOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Color palette for categories
const categoryColors = [
  'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'gold', 'lime',
];

function getCategoryColor(index: number) {
  return categoryColors[index % categoryColors.length];
}

const sessionColors: Record<string, string> = {
  SS1: 'blue',
  SS2: 'cyan',
  SS3: 'green',
  SS4: 'orange',
  SS5: 'volcano',
  SS6: 'purple',
};

interface Stats {
  posts: number;
  reports: number;
  trades: number;
}

export default function HomePageClient() {
  const { token } = theme.useToken();
  const [posts, setPosts] = useState<(Post & { category: { name: string } | null })[]>([]);
  const [reports, setReports] = useState<TradingReport[]>([]);
  const [stats, setStats] = useState<Stats>({ posts: 0, reports: 0, trades: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch all in parallel
      const [postsRes, reportsRes, postCount, reportCount, tradeCount] =
        await Promise.all([
          // Recent published posts (limit 6)
          supabase
            .from('posts')
            .select('*, category:categories(name)')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(6),
          // Recent published reports (limit 4)
          supabase
            .from('trading_reports')
            .select('*')
            .eq('status', 'published')
            .order('report_date', { ascending: false })
            .limit(4),
          // Counts
          supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published'),
          supabase
            .from('trading_reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published'),
          supabase
            .from('trades')
            .select('*', { count: 'exact', head: true }),
        ]);

      if (postsRes.data) setPosts(postsRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
      setStats({
        posts: postCount.count ?? 0,
        reports: reportCount.count ?? 0,
        trades: tradeCount.count ?? 0,
      });

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: 48, paddingTop: 16 }}>
        <Title level={1} style={{ marginBottom: 8 }}>
          Reviews, Trading & Knowledge
        </Title>
        <Paragraph
          style={{ fontSize: 16, color: token.colorTextSecondary, maxWidth: 600, margin: '0 auto' }}
        >
          Chia sẻ kiến thức từ sách, tài liệu và hành trình giao dịch crypto cá nhân.
        </Paragraph>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Space>
              <BookOutlined style={{ fontSize: 28, color: token.colorPrimary }} />
              <div>
                <Text type="secondary">Bài viết</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {loading ? '—' : stats.posts}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space>
              <LineChartOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              <div>
                <Text type="secondary">Trading Reports</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {loading ? '—' : stats.reports}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space>
              <BarChartOutlined style={{ fontSize: 28, color: '#fa8c16' }} />
              <div>
                <Text type="secondary">Giao dịch</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {loading ? '—' : stats.trades}
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Posts */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          <ReadOutlined /> Bài viết mới nhất
        </Title>
        <Link href="/posts">
          <Button type="link" icon={<ArrowRightOutlined />} iconPosition="end">
            Xem tất cả
          </Button>
        </Link>
      </div>

      {loading ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} md={8} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : posts.length === 0 ? (
        <Empty
          description="Chưa có bài viết nào"
          style={{ marginBottom: 48 }}
        />
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
          {posts.map((post, idx) => (
            <Col xs={24} sm={12} md={8} key={post.id}>
              <Link href={`/posts/${post.slug}`} style={{ display: 'block', height: '100%' }}>
                <Card hoverable style={{ height: '100%' }}>
                  {post.category && (
                    <Tag color={getCategoryColor(idx)} style={{ marginBottom: 8 }}>
                      {post.category.name}
                    </Tag>
                  )}
                  <Title level={5} style={{ marginTop: 0 }}>
                    {post.title}
                  </Title>
                  {post.author_name && (
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                      Tác giả: {post.author_name}
                    </Text>
                  )}
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 3 }}
                    style={{ marginBottom: 8 }}
                  >
                    {post.excerpt || 'Chưa có mô tả...'}
                  </Paragraph>
                  {post.published_at && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <CalendarOutlined />{' '}
                      {new Date(post.published_at).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}

      {/* Recent Trading Reports */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          <LineChartOutlined /> Trading Reports gần đây
        </Title>
        <Link href="/trading-reports">
          <Button type="link" icon={<ArrowRightOutlined />} iconPosition="end">
            Xem tất cả
          </Button>
        </Link>
      </div>

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2].map((i) => (
            <Col xs={24} md={12} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : reports.length === 0 ? (
        <Empty description="Chưa có trading report nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {reports.map((report) => (
            <Col xs={24} sm={12} key={report.id}>
              <Link
                href={`/trading-reports/${report.id}`}
                style={{ display: 'block', height: '100%' }}
              >
                <Card hoverable style={{ height: '100%' }}>
                  <Space style={{ marginBottom: 8 }}>
                    <Tag color={sessionColors[report.session] || 'default'}>
                      {report.session}
                    </Tag>
                    <Text type="secondary">
                      <CalendarOutlined />{' '}
                      {new Date(report.report_date).toLocaleDateString('vi-VN')}
                    </Text>
                  </Space>
                  <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
                    {report.title}
                  </Title>
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 0 }}
                  >
                    {/* Strip HTML tags for preview */}
                    {report.content?.replace(/<[^>]*>/g, '').slice(0, 150) || 'Chưa có nội dung...'}
                  </Paragraph>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}
