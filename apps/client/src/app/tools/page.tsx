import type { Metadata } from 'next';
import ToolsClient from './_components/ToolsClient';

export const metadata: Metadata = {
  title: 'Công cụ giao dịch',
  description: 'Tính toán khối lượng lot, Stop Loss và Take Profit theo quản lý vốn',
};

export default function ToolsPage() {
  return <ToolsClient />;
}