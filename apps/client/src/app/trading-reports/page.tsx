import type { Metadata } from 'next';
import TradingReportsClient from './_components/ReportsClient';

export const metadata: Metadata = {
  title: 'Trading Reports',
  description: 'Nhật ký giao dịch crypto — phân tích từng phiên, chiến lược và kết quả thực tế.',
  openGraph: {
    title: 'Trading Reports | PhuocPM Blog',
    description: 'Nhật ký giao dịch crypto — phân tích từng phiên, chiến lược và kết quả thực tế.',
  },
};

export default function TradingReportsPage() {
  return <TradingReportsClient />;
}
