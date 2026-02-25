'use client';

import { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Tag, Space, Button } from 'antd';
import {
  BookOutlined,
  LineChartOutlined,
  SwapOutlined,
  PlusOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { supabase } from '@/lib/supabase';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState({
    posts: 0,
    reports: 0,
    trades: 0,
    categories: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [postsRes, reportsRes, tradesRes, categoriesRes] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('trading_reports').select('*', { count: 'exact', head: true }),
        supabase.from('trades').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        posts: postsRes.count ?? 0,
        reports: reportsRes.count ?? 0,
        trades: tradesRes.count ?? 0,
        categories: categoriesRes.count ?? 0,
      });
    }

    loadStats();
  }, []);

  return (
    <>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng bài viết"
              value={stats.posts}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Trading Reports"
              value={stats.reports}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giao dịch"
              value={stats.trades}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Categories"
              value={stats.categories}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Chào mừng đến Admin Panel 👋">
        <Text>
          Sử dụng menu bên trái để quản lý nội dung blog, trading reports và giao dịch.
        </Text>
      </Card>
    </>
  );
}
