'use client';

import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import Footer from './Footer';

const { Content } = Layout;

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Chạy ngay 1 lần khi mount
    setVisible(window.scrollY > 400);

    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Lên đầu trang"
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#1677ff',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        boxShadow: '0 4px 16px rgba(22,119,255,0.45)',
        zIndex: 9999,
        transition: 'opacity 0.2s, transform 0.2s, background 0.2s',
        // Dùng opacity thay vì return null — tránh unmount/mount liên tục
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#0958d9';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#1677ff';
        e.currentTarget.style.transform = visible ? 'translateY(0)' : 'translateY(12px)';
      }}
    >
      <VerticalAlignTopOutlined />
    </button>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
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

      {/* Nằm ngoài Layout — không bị stacking context ảnh hưởng */}
      <ScrollToTop />
    </>
  );
}