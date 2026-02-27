'use client';

import { Layout } from 'antd';
import Navbar from './Navbar';
import Footer from './Footer';

const { Content } = Layout;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
