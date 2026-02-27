'use client';

import Link from 'next/link';
import { Layout, Typography, Space, Grid } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function Footer() {
  const screens = useBreakpoint();

  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#fafafa',
        borderTop: '1px solid #f0f0f0',
        padding: screens.md ? '24px 48px' : '24px 16px',
      }}
    >
      <Space direction="vertical" size={4}>
        <Space split="·" size="middle">
          <Link href="/" style={{ color: 'inherit' }}>Trang chủ</Link>
          <Link href="/posts" style={{ color: 'inherit' }}>Bài viết</Link>
          <Link href="/trading-reports" style={{ color: 'inherit' }}>Trading Reports</Link>
          <Link href="/trading-dashboard" style={{ color: 'inherit' }}>Dashboard</Link>
        </Space>
        <Space size="middle">
          <Text type="secondary">
            © 2026 PhuocPM Blog — Built with Next.js, Ant Design & Supabase
          </Text>
          <a
            href="https://github.com/phuocpm19/my-blog"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit' }}
          >
            <GithubOutlined style={{ fontSize: 18 }} />
          </a>
        </Space>
      </Space>
    </AntFooter>
  );
}
