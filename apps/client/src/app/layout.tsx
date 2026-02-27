import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Blog — Reviews, Trading & Knowledge',
  description:
    'Blog cá nhân chia sẻ review sách, phân tích giao dịch crypto và kiến thức tổng hợp.',
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
