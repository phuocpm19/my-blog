'use client';

import { useParams } from 'next/navigation';
import ReportForm from '../../_components/ReportForm';

export default function EditReportPage() {
  const { id } = useParams<{ id: string }>();
  return <ReportForm reportId={id} />;
}
