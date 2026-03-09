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
  Select,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { supabase } from '@/lib/supabase';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PAIRS = ['BTC', 'ETH', 'XAU'];
const SESSIONS = ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];
const REPORT_TYPES = ['Session', 'Daily Handoff'];

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
  const [reportType, setReportType] = useState<'Session' | 'Daily Handoff'>('Session');

  // Tự động tạo tên báo cáo
  const updateTitle = (type?: 'Session' | 'Daily Handoff') => {
    const currentType = type ?? reportType;
    const date = form.getFieldValue('report_date');
    const pair = form.getFieldValue('pair');
    const session = form.getFieldValue('session');
    if (currentType === 'Daily Handoff') {
      if (date && pair) {
        form.setFieldValue('title', `${dayjs(date).format('YYYYMMDD')} ${pair} Daily Handoff`);
      } else {
        form.setFieldValue('title', '');
      }
    } else {
      if (date && pair && session) {
        form.setFieldValue('title', `${dayjs(date).format('YYYYMMDD')} ${pair} ${session}`);
      } else {
        form.setFieldValue('title', '');
      }
    }
  };

  useEffect(() => {
    if (!reportId) {
      form.setFieldsValue({
        report_date: dayjs(),
        pair: 'BTC',
        report_type: 'Session',
      });
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

      const detectedType = data.title?.endsWith('Daily Handoff') ? 'Daily Handoff' : 'Session';
      // Set state trước để disabled/required render đúng ngay khi form hiện
      setReportType(detectedType);
      form.setFieldsValue({
        title: data.title,
        report_type: detectedType,
        session: detectedType === 'Daily Handoff' ? null : (data.session || null),
        pair: data.pair || 'BTC',
        report_date: dayjs(data.report_date),
      });
      setContent(data.content || '');
      setLoading(false);
    }
    loadReport();
  }, [reportId, form, router]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const reportData = {
        title: values.title,
        content,
        session: reportType === 'Daily Handoff' ? null : values.session,
        pair: values.pair,
        report_date: values.report_date.format('YYYY-MM-DD'),
        status: 'published',
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
      if (err?.message) message.error('Lỗi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Header */}
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

        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          {isEditing ? 'Cập nhật' : 'Tạo báo cáo'}
        </Button>
      </div>

      <Form form={form} layout="vertical" disabled={loading}>
        <Row gutter={24}>
          {/* LEFT — Thông tin báo cáo */}
          <Col xs={24} lg={8}>
            <Card title="Thông tin báo cáo" style={{ position: 'sticky', top: 80 }}>
              {/* Hàng 1: Loại báo cáo + Tên báo cáo */}
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="report_type" label="Loại báo cáo">
                    <Select
                      onChange={(val: 'Session' | 'Daily Handoff') => {
                        setReportType(val);
                        if (val === 'Daily Handoff') {
                          form.setFieldValue('session', null);
                        }
                        updateTitle(val);
                      }}
                    >
                      {REPORT_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="title" label="Tên báo cáo">
                    <Input
                      placeholder="Tự động điền"
                      readOnly
                      style={{ background: '#f5f5f5', cursor: 'default' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Ngày phân tích */}
              <Form.Item
                name="report_date"
                label="Ngày phân tích"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  onChange={() => updateTitle()}
                />
              </Form.Item>

              {/* Cặp giao dịch */}
              <Form.Item
                name="pair"
                label="Cặp giao dịch"
                rules={[{ required: true, message: 'Vui lòng chọn cặp' }]}
              >
                <Select placeholder="Chọn cặp" onChange={() => updateTitle()}>
                  {PAIRS.map((p) => <Option key={p} value={p}>{p}</Option>)}
                </Select>
              </Form.Item>

              {/* Session */}
              <Form.Item
                name="session"
                label="Session"
                rules={[{ required: reportType === 'Session', message: 'Vui lòng chọn session' }]}
              >
                <Select
                  placeholder={reportType === 'Daily Handoff' ? 'Không áp dụng' : 'Chọn session'}
                  onChange={() => updateTitle()}
                  disabled={reportType === 'Daily Handoff'}
                >
                  {SESSIONS.map((s) => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* RIGHT — Nội dung phân tích */}
          <Col xs={24} lg={16}>
            <Card
              title="Nội dung phân tích"
              extra={
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                  Paste nội dung từ file .txt vào đây
                </span>
              }
            >
              <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste hoặc nhập nội dung phân tích trading..."
                style={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  lineHeight: 1.7,
                  resize: 'vertical',
                  minHeight: 500,
                  maxHeight: 600,
                }}
                autoSize={false}
              />
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}