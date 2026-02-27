'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { TradingReport } from 'shared';

import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Input,
  Select,
  Space,
  Pagination,
  Skeleton,
  Empty,
  theme,
} from 'antd';
import {
  CalendarOutlined,
  SearchOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const sessionOptions = [
  { value: 'SS1', label: 'SS1' },
  { value: 'SS2', label: 'SS2' },
  { value: 'SS3', label: 'SS3' },
  { value: 'SS4', label: 'SS4' },
  { value: 'SS5', label: 'SS5' },
  { value: 'SS6', label: 'SS6' },
];

const sessionColors: Record<string, string> = {
  SS1: 'blue',
  SS2: 'cyan',
  SS3: 'green',
  SS4: 'orange',
  SS5: 'volcano',
  SS6: 'purple',
};

const PAGE_SIZE = 10;

export default function TradingReportsPage() {
  const { token } = theme.useToken();
  const [reports, setReports] = useState<TradingReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('trading_reports')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('report_date', { ascending: false });

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    if (sessionFilter) {
      query = query.eq('session', sessionFilter);
    }

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;

    if (data) setReports(data);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, sessionFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSessionChange = (value: string | undefined) => {
    setSessionFilter(value || undefined);
    setPage(1);
  };

  return (
    <>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          <LineChartOutlined /> Trading Reports
        </Title>
        <Text type="secondary">
          Tổng cộng {total} báo cáo
        </Text>
      </div>

      {/* Filters */}
      <Space wrap size="middle" style={{ marginBottom: 24, width: '100%' }}>
        <Input
          placeholder="Tìm kiếm báo cáo..."
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          placeholder="Tất cả sessions"
          allowClear
          onChange={handleSessionChange}
          style={{ width: 160 }}
          options={sessionOptions}
        />
      </Space>

      {/* Reports List */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : reports.length === 0 ? (
        <Empty
          description={search || sessionFilter ? 'Không tìm thấy báo cáo nào' : 'Chưa có báo cáo nào'}
          style={{ padding: '48px 0' }}
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {reports.map((report) => (
              <Col xs={24} sm={12} key={report.id}>
                <Link
                  href={`/trading-reports/${report.id}`}
                  style={{ display: 'block', height: '100%' }}
                >
                  <Card hoverable style={{ height: '100%' }}>
                    <Space style={{ marginBottom: 8 }}>
                      <Tag color={sessionColors[report.session] || 'default'}>
                        {report.session}
                      </Tag>
                      <Text type="secondary">
                        <CalendarOutlined />{' '}
                        {new Date(report.report_date).toLocaleDateString('vi-VN')}
                      </Text>
                    </Space>
                    <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
                      {report.title}
                    </Title>
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 0 }}
                    >
                      {report.content?.replace(/<[^>]*>/g, '').slice(0, 150) || 'Chưa có nội dung...'}
                    </Paragraph>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          {total > PAGE_SIZE && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={setPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
