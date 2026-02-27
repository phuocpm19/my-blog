'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Menu, Button, Drawer, Grid, Typography } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  LineChartOutlined,
  FundOutlined,
  MenuOutlined,
} from '@ant-design/icons';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const navItems = [
  { key: '/', icon: <HomeOutlined />, label: <Link href="/">Trang chủ</Link> },
  { key: '/posts', icon: <ReadOutlined />, label: <Link href="/posts">Bài viết</Link> },
  {
    key: '/trading-reports',
    icon: <LineChartOutlined />,
    label: <Link href="/trading-reports">Trading Reports</Link>,
  },
  {
    key: '/trading-dashboard',
    icon: <FundOutlined />,
    label: <Link href="/trading-dashboard">Dashboard</Link>,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Determine active key from pathname
  const selectedKey = pathname === '/' ? '/' : `/${pathname.split('/')[1]}`;

  return (
    <>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: screens.md ? '0 48px' : '0 16px',
          height: 64,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', marginRight: 32 }}>
          <Typography.Title level={4} style={{ margin: 0, whiteSpace: 'nowrap' }}>
            📝 My Blog
          </Typography.Title>
        </Link>

        {screens.md ? (
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={navItems}
            style={{ flex: 1, border: 'none', background: 'transparent' }}
          />
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {!screens.md && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
          />
        )}
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="📝 My Blog"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={[selectedKey]}
          items={navItems}
          style={{ border: 'none' }}
          onClick={() => setDrawerOpen(false)}
        />
      </Drawer>
    </>
  );
}
