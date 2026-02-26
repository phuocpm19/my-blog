'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Space,
  message,
  Typography,
  DatePicker,
  Divider,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { supabase } from '@/lib/supabase';
import RichEditor from '../../posts/_components/RichEditor';

const { Title } = Typography;

interface ReportFormProps {
  reportId?: string;
}

export default function ReportForm({ reportId }: ReportFormProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const isEditing = !!reportId;

  useEffect(() => {
    if (!reportId) {
      // Mặc định ngày hôm nay
      form.setFieldsValue({ report_date: dayjs() });
      return;
    }

    async function loadReport() {
      setLoading(true);
      const { data, error } = await supabase
        .from('trading_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error || !data) {
        message.error('Không tìm thấy report');
        router.push('/trading-reports');
        return;
      }

      form.setFieldsValue({
        title: data.title,
        session: data.session || '',
        report_date: dayjs(data.report_date),
      });
      setContent(data.content || '');
      setLoading(false);
    }
    loadReport();
  }, [reportId, form, router]);

  const handleSave = async (status: 'draft' | 'published') => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const reportData = {
        title: values.title,
        content,
        session: values.session || null,
        report_date: values.report_date.format('YYYY-MM-DD'),
        status,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('trading_reports')
          .update(reportData)
          .eq('id', reportId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trading_reports')
          .insert(reportData);
        if (error) throw error;
      }

      message.success(isEditing ? 'Đã cập nhật report' : 'Đã tạo report mới');
      router.push('/trading-reports');
    } catch (err: any) {
      if (err?.message) {
        message.error('Lỗi: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

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
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/trading-reports')}
          >
            Quay lại
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {isEditing ? 'Chỉnh sửa report' : 'Tạo report mới'}
          </Title>
        </Space>

        <Space>
          <Button
            icon={<SaveOutlined />}
            onClick={() => handleSave('draft')}
            loading={saving}
          >
            Lưu nháp
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSave('published')}
            loading={saving}
          >
            Xuất bản
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" disabled={loading}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input placeholder="VD: Phân tích BTC/USDT - Phiên châu Á" size="large" autoFocus />
              </Form.Item>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Nội dung phân tích
                </label>
                <RichEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Viết nội dung phân tích trading..."
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Thông tin">
              <Form.Item
                name="report_date"
                label="Ngày phân tích"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="session" label="Session">
                <Input placeholder="VD: Asia, US, London" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}
