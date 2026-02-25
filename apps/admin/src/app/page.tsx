'use client';

import { useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Button,
  theme,
} from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TagsOutlined,
  FileTextOutlined,
  LineChartOutlined,
  SwapOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const siderMenuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'categories', icon: <AppstoreOutlined />, label: 'Categories' },
  { key: 'tags', icon: <TagsOutlined />, label: 'Tags' },
  { key: 'posts', icon: <FileTextOutlined />, label: 'Bài viết' },
  { key: 'trading-reports', icon: <LineChartOutlined />, label: 'Trading Reports' },
  { key: 'trades', icon: <SwapOutlined />, label: 'Giao dịch' },
];

const recentPostsData = [
  {
    key: '1',
    title: 'Review: Atomic Habits',
    category: 'Sách Kỹ Năng',
    status: 'published',
    date: '2026-02-25',
  },
  {
    key: '2',
    title: 'Trading Psychology: Tâm lý cầm lệnh',
    category: 'Trading',
    status: 'draft',
    date: '2026-02-24',
  },
  {
    key: '3',
    title: 'Review: Thinking, Fast and Slow',
    category: 'Sách Tâm Lý',
    status: 'published',
    date: '2026-02-23',
  },
];

const recentTradesData = [
  {
    key: '1',
    pair: 'BTC/USDT',
    side: 'Long',
    pnl: 125.5,
    date: '2026-02-25',
  },
  {
    key: '2',
    pair: 'ETH/USDT',
    side: 'Short',
    pnl: -42.3,
    date: '2026-02-24',
  },
  {
    key: '3',
    pair: 'SOL/USDT',
    side: 'Long',
    pnl: 67.8,
    date: '2026-02-24',
  },
];

const postColumns = [
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
  { title: 'Category', dataIndex: 'category', key: 'category' },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === 'published' ? 'green' : 'default'}>
        {status === 'published' ? 'Đã xuất bản' : 'Nháp'}
      </Tag>
    ),
  },
  { title: 'Ngày', dataIndex: 'date', key: 'date' },
];

const tradeColumns = [
  { title: 'Pair', dataIndex: 'pair', key: 'pair' },
  {
    title: 'Side',
    dataIndex: 'side',
    key: 'side',
    render: (side: string) => (
      <Tag color={side === 'Long' ? 'green' : 'red'}>{side}</Tag>
    ),
  },
  {
    title: 'PnL (USDT)',
    dataIndex: 'pnl',
    key: 'pnl',
    render: (pnl: number) => (
      <Text style={{ color: pnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
        {pnl >= 0 ? '+' : ''}
        {pnl.toFixed(2)}
      </Text>
    ),
  },
  { title: 'Ngày', dataIndex: 'date', key: 'date' },
];

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {collapsed ? '📝' : '📝 Admin'}
          </Title>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={siderMenuItems}
          style={{ borderRight: 'none' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Text type="secondary">Xin chào, Admin 👋</Text>
        </Header>

        <Content style={{ padding: 24 }}>
          <Title level={3} style={{ marginBottom: 24 }}>
            Dashboard
          </Title>

          {/* Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng bài viết"
                  value={24}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: token.colorPrimary }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Trading Reports"
                  value={156}
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng giao dịch"
                  value={432}
                  prefix={<SwapOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng PnL"
                  value={1250.8}
                  precision={2}
                  prefix={<RiseOutlined />}
                  suffix="USDT"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Tables */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title="Bài viết gần đây"
                extra={
                  <Button type="primary" size="small" icon={<PlusOutlined />}>
                    Thêm mới
                  </Button>
                }
              >
                <Table
                  columns={postColumns}
                  dataSource={recentPostsData}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="Giao dịch gần đây"
                extra={
                  <Button type="primary" size="small" icon={<PlusOutlined />}>
                    Thêm mới
                  </Button>
                }
              >
                <Table
                  columns={tradeColumns}
                  dataSource={recentTradesData}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}
