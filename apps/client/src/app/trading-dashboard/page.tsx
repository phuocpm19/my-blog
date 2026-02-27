import type { Metadata } from 'next';
import DashboardClient from './_components/DashboardClient';

export const metadata: Metadata = {
  title: 'Trading Dashboard',
  description: 'Tổng hợp hiệu suất giao dịch crypto — PnL, win rate, phân tích theo pair và chiến lược.',
  openGraph: {
    title: 'Trading Dashboard | PhuocPM Blog',
    description: 'Tổng hợp hiệu suất giao dịch crypto — PnL, win rate, phân tích theo pair và chiến lược.',
  },
};

export default function TradingDashboardPage() {
  return <DashboardClient />;
}
