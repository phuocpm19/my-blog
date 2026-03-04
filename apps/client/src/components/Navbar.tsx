'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Menu, Button, Drawer, Grid, Typography, Tooltip } from 'antd';
import {
  HomeOutlined,
  ReadOutlined,
  LineChartOutlined,
  FundOutlined,
  MenuOutlined,
  SearchOutlined,
  CalculatorOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import SearchModal from './SearchModal';
import { useTheme } from './ThemeContext';

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
    label: <Link href="/trading-dashboard">Trading History</Link>,
  },
  {
    key: '/tools',
    icon: <CalculatorOutlined />,
    label: <Link href="/tools">Công cụ</Link>,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  const selectedKey = pathname === '/' ? '/' : `/${pathname.split('/')[1]}`;

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
          // Fix tràn ngang: width 100% + maxWidth khớp Content
          width: '100%',
          maxWidth: '100vw',
          display: 'flex',
          alignItems: 'center',
          background: isDark ? '#1f1f1f' : '#fff',
          borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          // Dùng padding responsive, KHÔNG dùng giá trị lớn trên mobile
          padding: screens.md ? '0 48px' : '0 12px',
          height: 64,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'background 0.2s ease',
          // Quan trọng: ngăn header tự mở rộng hơn viewport
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            // flexShrink:0 để logo không bị co lại khi menu dài
            flexShrink: 0,
            marginRight: 24,
          }}
        >
          <Typography.Title level={4} style={{ margin: 0, whiteSpace: 'nowrap' }}>
            📝 My Blog
          </Typography.Title>
        </Link>

        {/* Menu desktop — flex:1 để chiếm hết khoảng còn lại */}
        {screens.md ? (
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={navItems}
            style={{
              flex: 1,
              minWidth: 0, // quan trọng: cho phép menu co lại thay vì tràn
              border: 'none',
              background: 'transparent',
              overflow: 'hidden',
            }}
          />
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {/* Actions: Search + Dark mode toggle + Mobile menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Search */}
          <Tooltip title={screens.md ? 'Tìm kiếm (Ctrl+K)' : 'Tìm kiếm'}>
            <Button
              type="text"
              icon={<SearchOutlined style={{ fontSize: 18 }} />}
              onClick={() => setSearchOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {screens.md && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    border: `1px solid ${isDark ? '#434343' : '#d9d9d9'}`,
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

          {/* Dark mode toggle */}
          <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
            <Button
              type="text"
              icon={
                isDark
                  ? <SunOutlined style={{ fontSize: 17, color: '#faad14' }} />
                  : <MoonOutlined style={{ fontSize: 17, color: '#595959' }} />
              }
              onClick={toggle}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Tooltip>

          {/* Mobile hamburger */}
          {!screens.md && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
            />
          )}
        </div>
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
        <div style={{
          padding: '16px 0',
          borderTop: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          marginTop: 8,
        }}>
          <Button
            type="text"
            icon={isDark ? <SunOutlined style={{ color: '#faad14' }} /> : <MoonOutlined />}
            onClick={() => { toggle(); setDrawerOpen(false); }}
            style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
          >
            {isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
          </Button>
        </div>
      </Drawer>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}