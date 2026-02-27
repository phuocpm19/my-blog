import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://my-blog-client.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PhuocPM Blog — Reviews, Trading & Knowledge',
    template: '%s | PhuocPM Blog',
  },
  description:
    'Blog cá nhân chia sẻ review sách, phân tích giao dịch crypto và kiến thức tổng hợp.',
  keywords: ['blog', 'book review', 'crypto trading', 'trading journal', 'kiến thức'],
  authors: [{ name: 'PhuocPM' }],
  creator: 'PhuocPM',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'PhuocPM Blog',
    title: 'PhuocPM Blog — Reviews, Trading & Knowledge',
    description:
      'Blog cá nhân chia sẻ review sách, phân tích giao dịch crypto và kiến thức tổng hợp.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhuocPM Blog — Reviews, Trading & Knowledge',
    description:
      'Blog cá nhân chia sẻ review sách, phân tích giao dịch crypto và kiến thức tổng hợp.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning>
        <AntdRegistry>
          <ClientLayout>{children}</ClientLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
