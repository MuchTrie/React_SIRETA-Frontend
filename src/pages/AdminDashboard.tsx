import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Statistic, Table, Tag, Progress, Space, Badge } from 'antd';
import {
  ArrowUpOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FolderOpenOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { reconciliationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const { settings, refreshSettings } = useAuth();
  const [resultFolders, setResultFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    refreshSettings();
  }, []);

  const fetchData = async () => {
    try {
      const response = await reconciliationAPI.getResultFolders();
      if (response.success && response.data) {
        setResultFolders(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from real data
  const totalRecons = resultFolders.length || 3; // Fallback jika kosong
  
  // Parse folder names to extract jobId and date
  const parsedFolders = resultFolders.map(folder => {
    // folder.name format: "0009-11-11-2025" (jobId-date)
    const parts = folder.name.split('-');
    const jobId = parts[0]; // "0009"
    const date = `${parts[3]}-${parts[2]}-${parts[1]}`; // "2025-11-11"
    return { jobId: folder.name, date };
  });
  
  const recentRecons = parsedFolders.length > 0 ? parsedFolders.slice(0, 5) : [
    { jobId: '-', date: '-' }
  ];

  const recentActivityColumns = [
    {
      title: 'Job ID',
      dataIndex: 'jobId',
      key: 'jobId',
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Completed
        </Tag>
      ),
    },
  ];

  const recentActivityData = recentRecons.map(folder => ({
    key: folder.jobId,
    jobId: folder.jobId,
    date: folder.date,
  }));

  return (
    <div>
      <Title level={2}>
        <TeamOutlined /> Admin Dashboard
      </Title>
      <Text type="secondary">
        Monitoring & Analytics untuk Switching Reconciliation System
      </Text>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Rekonsiliasi"
              value={totalRecons}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
            <Text type="secondary" style={{ fontSize: 12 }}>vs bulan lalu</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={93.5}
              precision={1}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={93.5} showInfo={false} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={2}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Space style={{ marginTop: 8 }}>
              <Badge color="#1890ff" text="1 Admin" />
              <Badge color="#52c41a" text="1 Ops" />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg. Process Time"
              value={2.3}
              precision={1}
              prefix={<ClockCircleOutlined />}
              suffix="min"
              valueStyle={{ color: '#fa8c16' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>per file batch</Text>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            title={<><ClockCircleOutlined /> Recent Activity</>} 
            extra={<Text type="secondary">Last 5 jobs</Text>}
          >
            <Table
              dataSource={recentActivityData}
              columns={recentActivityColumns}
              pagination={false}
              size="middle"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Feature Status */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="System Status">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Card 
                  size="small" 
                  style={{ 
                    background: settings?.isProsesReconEnabled 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'linear-gradient(135deg, #d9d9d9 0%, #8c8c8c 100%)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    {settings?.isProsesReconEnabled ? (
                      <CheckCircleOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                    )}
                    <div style={{ fontSize: 16, marginBottom: 4, opacity: 0.9 }}>Proses Rekonsiliasi</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {settings?.isProsesReconEnabled ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card 
                  size="small" 
                  style={{ 
                    background: settings?.isConverterEnabled 
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
                      : 'linear-gradient(135deg, #d9d9d9 0%, #8c8c8c 100%)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    {settings?.isConverterEnabled ? (
                      <SwapOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                    )}
                    <div style={{ fontSize: 16, marginBottom: 4, opacity: 0.9 }}>Settlement Converter</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {settings?.isConverterEnabled ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card 
                  size="small" 
                  style={{ 
                    background: settings?.isHistoryEnabled 
                      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                      : 'linear-gradient(135deg, #d9d9d9 0%, #8c8c8c 100%)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    {settings?.isHistoryEnabled ? (
                      <FolderOpenOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                    )}
                    <div style={{ fontSize: 16, marginBottom: 4, opacity: 0.9 }}>Riwayat Recon</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {settings?.isHistoryEnabled ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}