'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Typography, Button, theme, Dropdown, Tag } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TagsOutlined,
  FileTextOutlined,
  LineChartOutlined,
  SwapOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth-context';
import RouteProgress from './_components/RouteProgress';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const { user, role, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  // Menu items theo role
  // Editor: Dashboard, Categories, Tags, Posts
  // Admin: tất cả + Users
  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
    { key: '/tags', icon: <TagsOutlined />, label: 'Tags' },
    { key: '/posts', icon: <FileTextOutlined />, label: 'Bài viết' },
    // Chỉ admin mới thấy Trading Reports và Trades
    ...(isAdmin ? [
      { key: '/trading-reports', icon: <LineChartOutlined />, label: 'Trading Reports' },
      { key: '/trades', icon: <SwapOutlined />, label: 'Giao dịch' },
      { key: '/statistics', icon: <BarChartOutlined />, label: 'Thống kê' },
      { key: '/trading-accounts', icon: <WalletOutlined />, label: 'Tài khoản' },
    ] : []),
    // Chỉ admin mới thấy Users
    ...(isAdmin ? [
      { key: '/users', icon: <TeamOutlined />, label: 'Quản lý Users' },
    ] : []),
  ];

  const roleLabel = role === 'admin'
    ? <Tag color="red" style={{ margin: 0 }}>Admin</Tag>
    : <Tag color="blue" style={{ margin: 0 }}>Biên tập viên</Tag>;

  const userMenuItems = [
    {
      key: 'email',
      label: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
          {roleLabel}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: signOut,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <RouteProgress />
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {collapsed ? '📝' : '📝 Admin'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ borderRight: 'none' }}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              {!collapsed && (role === 'admin' ? 'Admin' : 'Biên tập viên')}
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}