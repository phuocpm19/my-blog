import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'My Blog — Admin',
  description: 'Admin panel for My Blog',
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
          <AuthProvider>{children}</AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
