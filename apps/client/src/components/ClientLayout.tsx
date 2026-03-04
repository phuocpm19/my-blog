'use client';

import { useEffect, useState } from 'react';
import { ConfigProvider, Layout, theme as antTheme } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import Footer from './Footer';
import { ThemeProvider, useTheme } from './ThemeContext';

const { Content } = Layout;

// ─── Scroll To Top ────────────────────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function check() {
      // Đọc từ cả 2 nguồn để tương thích mọi browser/layout
      const scrollY =
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setVisible(scrollY > 400);
    }
    check();
    // capture:true bắt event trước khi bubble — quan trọng với Ant Design Layout
    document.addEventListener('scroll', check, { passive: true, capture: true });
    return () => document.removeEventListener('scroll', check, { capture: true });
  }, []);

  return (
    // Dùng opacity + pointer-events thay vì if(!visible) return null
    // Tránh unmount/mount làm mất transition và reset state
    <button
      onClick={() => {
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      title="Lên đầu trang"
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: 32,
        // Sát cạnh phải bài viết (maxWidth 780px centered)
        right: 'max(16px, calc(50vw - 390px - 56px))',
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#1677ff',
        color: '#fff',
        border: 'none',
        cursor: visible ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        boxShadow: '0 4px 16px rgba(22,119,255,0.40)',
        zIndex: 9999,
        // opacity + pointerEvents: không unmount, giữ transition mượt
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      <VerticalAlignTopOutlined />
    </button>
  );
}

// ─── Inner layout ─────────────────────────────────────────────────────────────
function InnerLayout({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff', borderRadius: 8 },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: isDark ? '#141414' : '#ffffff' }}>
        <Navbar />
        <Content
          style={{
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
            padding: '32px 16px',
          }}
        >
          {children}
        </Content>
        <Footer />
      </Layout>

      {/*
        ScrollToTop nằm NGOÀI Layout — tránh bị ảnh hưởng bởi
        overflow/stacking context của Ant Design.
        Đồng thời cũng nằm ngoài div có overflow:hidden nếu có.
      */}
      <ScrollToTop />
    </ConfigProvider>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <InnerLayout>{children}</InnerLayout>
    </ThemeProvider>
  );
}