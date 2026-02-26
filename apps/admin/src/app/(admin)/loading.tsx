'use client';
import { Skeleton, Card, Space } from 'antd';

export default function AdminLoading() {
  return (
    <div>
      <Skeleton.Input active style={{ width: 200, marginBottom: 24 }} />
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton active paragraph={{ rows: 1 }} />
        </Space>
      </Card>
    </div>
  );
}
