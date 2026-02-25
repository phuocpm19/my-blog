'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Input,
  Menu,
  theme,
} from 'antd';
import {
  BookOutlined,
  LineChartOutlined,
  BarChartOutlined,
  SearchOutlined,
  HomeOutlined,
  ReadOutlined,
  FundOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const menuItems = [
  { key: 'home', icon: <HomeOutlined />, label: 'Trang chủ' },
  { key: 'posts', icon: <ReadOutlined />, label: 'Bài viết' },
  { key: 'trading-reports', icon: <LineChartOutlined />, label: 'Trading Reports' },
  { key: 'trading-dashboard', icon: <FundOutlined />, label: 'Trading Dashboard' },
];

const demoPosts = [
  {
    id: 1,
    title: 'Review: Atomic Habits — Thay đổi tí hon, hiệu quả bất ngờ',
    category: 'Sách Kỹ Năng',
    author: 'James Clear',
    excerpt:
      'Cuốn sách giúp bạn hiểu rõ cơ chế hình thành thói quen và cách xây dựng hệ thống thay đổi bền vững...',
    color: 'blue',
  },
  {
    id: 2,
    title: 'Trading Psychology: Tâm lý khi cầm lệnh ngược trend',
    category: 'Trading',
    author: '',
    excerpt:
      'Phân tích các sai lầm tâm lý phổ biến khi trader cố gắng bắt đáy hoặc giữ lệnh lỗ quá lâu...',
    color: 'red',
  },
  {
    id: 3,
    title: 'Review: Thinking, Fast and Slow — Hai hệ thống tư duy',
    category: 'Sách Tâm Lý',
    author: 'Daniel Kahneman',
    excerpt:
      'Cách não bộ đưa ra quyết định và tại sao chúng ta thường sai lầm trong phán đoán...',
    color: 'green',
  },
];

const demoReports = [
  {
    date: '2026-02-25',
    session: 'SS1',
    summary: 'BTC sideway quanh 96k, chờ breakout. ETH yếu hơn kỳ vọng.',
  },
  {
    date: '2026-02-24',
    session: 'SS3',
    summary: 'BTC test lại vùng hỗ trợ 94.5k, phản ứng tốt. Đã vào lệnh Long.',
  },
];

export default function HomePage() {
  const { token } = theme.useToken();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data, error }: { data: any; error: any}) => {
      console.log('Categories from Supabase:', data);
      if (error) console.error('Supabase error:', error);
      if (data) setCategories(data);
    });
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '0 24px',
        }}
      >
        <Title level={4} style={{ margin: '0 24px 0 0', whiteSpace: 'nowrap' }}>
          📝 My Blog
        </Title>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['home']}
          items={menuItems}
          style={{ flex: 1, border: 'none' }}
        />
        <Search
          placeholder="Tìm kiếm bài viết..."
          prefix={<SearchOutlined />}
          style={{ maxWidth: 280 }}
        />
      </Header>

      <Content style={{ padding: '32px 48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1}>Reviews, Trading & Knowledge</Title>
          <Paragraph style={{ fontSize: 16, color: token.colorTextSecondary }}>
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
                    24
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
                    156
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
                    432
                  </Title>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Recent Posts */}
        <Title level={3} style={{ marginBottom: 16 }}>
          <ReadOutlined /> Bài viết mới nhất
        </Title>
        <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
          {demoPosts.map((post) => (
            <Col xs={24} md={8} key={post.id}>
              <Card
                hoverable
                style={{ height: '100%' }}
              >
                <Tag color={post.color} style={{ marginBottom: 8 }}>
                  {post.category}
                </Tag>
                <Title level={5} style={{ marginTop: 0 }}>
                  {post.title}
                </Title>
                {post.author && (
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    Tác giả: {post.author}
                  </Text>
                )}
                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 3 }}
                  style={{ marginBottom: 0 }}
                >
                  {post.excerpt}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Recent Trading Reports */}
        <Title level={3} style={{ marginBottom: 16 }}>
          <LineChartOutlined /> Trading Reports gần đây
        </Title>
        <Row gutter={[16, 16]}>
          {demoReports.map((report, idx) => (
            <Col xs={24} md={12} key={idx}>
              <Card hoverable>
                <Space>
                  <Tag color="volcano">{report.session}</Tag>
                  <Text type="secondary">{report.date}</Text>
                </Space>
                <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                  {report.summary}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        My Blog ©2026 — Built with Next.js, Ant Design & Supabase
      </Footer>
    </Layout>
  );
}
