'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Menu, Button, Drawer, Grid, Typography, Space, Tooltip } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  LineChartOutlined,
  FundOutlined,
  MenuOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import SearchModal from './SearchModal';

const { Header } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

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
  const [searchOpen, setSearchOpen] = useState(false);

  // Determine active key from pathname
  const selectedKey = pathname === '/' ? '/' : `/${pathname.split('/')[1]}`;

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

        {/* Search button */}
        <Tooltip title={screens.md ? 'Tìm kiếm (Ctrl+K)' : 'Tìm kiếm'}>
          <Button
            type="text"
            icon={<SearchOutlined style={{ fontSize: 18 }} />}
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginRight: screens.md ? 0 : 8,
            }}
          >
            {screens.md && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  padding: '0 6px',
                  lineHeight: '20px',
                }}
              >
                Ctrl+K
              </Text>
            )}
          </Button>
        </Tooltip>

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

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
