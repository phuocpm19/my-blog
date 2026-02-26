'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Table,
  Button,
  Space,
  Input,
  Tag,
  message,
  Popconfirm,
  Select,
  Spin,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { supabase } from '@/lib/supabase';

const { Title, Text } = Typography;

interface TradingReport {
  id: string;
  title: string;
  session: string | null;
  report_date: string;
  status: 'draft' | 'published';
  created_at: string;
  trade_count?: number;
}

export default function TradingReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<TradingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trading_reports')
      .select('*, trades(count)')
      .order('report_date', { ascending: false });

    if (error) {
      message.error('Lỗi tải reports: ' + error.message);
    } else {
      const mapped = (data || []).map((r: any) => ({
        ...r,
        trade_count: r.trades?.[0]?.count ?? 0,
      }));
      setReports(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.session || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase.from('trading_reports').delete().eq('id', id);
    if (error) {
      message.error('Lỗi xóa: ' + error.message);
    } else {
      message.success('Đã xóa report');
      await loadReports();
    }
    setActionLoading(null);
  };

  const handleToggleStatus = async (report: TradingReport) => {
    setActionLoading(report.id);
    const newStatus = report.status === 'draft' ? 'published' : 'draft';
    const { error } = await supabase
      .from('trading_reports')
      .update({ status: newStatus })
      .eq('id', report.id);

    if (error) {
      message.error('Lỗi: ' + error.message);
    } else {
      message.success(newStatus === 'published' ? 'Đã xuất bản' : 'Đã chuyển về nháp');
      await loadReports();
    }
    setActionLoading(null);
  };

  const columns: TableColumnsType<TradingReport> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: 'Session',
      dataIndex: 'session',
      key: 'session',
      width: 120,
      render: (session: string | null) =>
        session ? <Tag color="blue">{session}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Ngày',
      dataIndex: 'report_date',
      key: 'report_date',
      width: 120,
      render: (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      title: 'Trades',
      dataIndex: 'trade_count',
      key: 'trade_count',
      width: 80,
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string, record: TradingReport) =>
        actionLoading === record.id ? (
          <Spin size="small" />
        ) : (
          <Tag
            color={status === 'published' ? 'green' : 'default'}
            style={{ cursor: 'pointer' }}
            onClick={() => handleToggleStatus(record)}
          >
            {status === 'published' ? 'Đã xuất bản' : 'Nháp'}
          </Tag>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_: any, record: TradingReport) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push(`/trading-reports/${record.id}/edit`)}
            disabled={actionLoading === record.id}
          />
          <Popconfirm
            title="Xóa trading report?"
            description="Các giao dịch liên kết sẽ mất report."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={actionLoading === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Trading Reports
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/trading-reports/new')}
        >
          Tạo report mới
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm report..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 140 }}
          options={[
            { value: 'draft', label: 'Nháp' },
            { value: 'published', label: 'Đã xuất bản' },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} reports`,
        }}
        locale={{ emptyText: 'Chưa có trading report nào' }}
      />
    </>
  );
}
