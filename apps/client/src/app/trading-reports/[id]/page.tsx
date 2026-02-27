import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ReportDetailClient from './_components/ReportDetailClient';

// Force dynamic rendering (metadata depends on DB data)
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { title: 'Trading Report' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: report } = await supabase
      .from('trading_reports')
      .select('title, session, report_date')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (!report) {
      return { title: 'Không tìm thấy báo cáo' };
    }

    const date = new Date(report.report_date).toLocaleDateString('vi-VN');
    const description = `Trading report ${report.session} ngày ${date} — phân tích chi tiết giao dịch crypto.`;

    return {
      title: report.title,
      description,
      openGraph: {
        title: report.title,
        description,
        type: 'article',
      },
    };
  } catch {
    return { title: 'Trading Report' };
  }
}

export default function TradingReportDetailPage() {
  return <ReportDetailClient />;
}
