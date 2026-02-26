'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Typography, Button, theme, Dropdown } from 'antd';
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
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth-context';
import RouteProgress from './_components/RouteProgress';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
  { key: '/tags', icon: <TagsOutlined />, label: 'Tags' },
  { key: '/posts', icon: <FileTextOutlined />, label: 'Bài viết' },
  { key: '/trading-reports', icon: <LineChartOutlined />, label: 'Trading Reports' },
  { key: '/trades', icon: <SwapOutlined />, label: 'Giao dịch' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Chưa đăng nhập → AuthProvider sẽ redirect, không render gì
  if (!user) return null;

  const userMenuItems = [
    {
      key: 'email',
      label: <Text type="secondary">{user.email}</Text>,
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
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
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
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              Admin
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
