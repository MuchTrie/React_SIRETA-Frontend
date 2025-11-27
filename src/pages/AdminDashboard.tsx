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
  const { settings, refreshSettings, isLoggedIn, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if user is logged in
    if (isLoggedIn && user) {
      console.log('✅ User is logged in, fetching dashboard data...');
      fetchData();
      refreshSettings();
    } else {
      console.warn('⚠️ User not logged in yet, waiting...');
    }
  }, [isLoggedIn, user]);

  const fetchData = async () => {
    try {
      console.log('🚀 Starting dashboard data fetch...');
      
      // Fetch folders for recent activity (works reliably)
      const foldersResponse = await reconciliationAPI.getResultFolders();
      console.log('📁 Folders Response:', foldersResponse);
      
      // Extract unique vendors from all folders
      let vendorSet = new Set<string>();
      
      if (foldersResponse.success && foldersResponse.data) {
        const folders = foldersResponse.data;
        console.log('✅ Got folders:', folders);
        
        // Parse folder data to create recent activity (EXACTLY like ResultHistory)
        const recentActivity = folders
          .filter((folder: any) => folder.name !== 'converted') // Exclude converted folder
          .slice(-5) // Get last 5 folders (most recent)
          .reverse() // Newest first
          .map((folder: any) => {
            const jobId = folder.name.split('-')[0]; // Extract "0001" from "0001-18-11-2025"
            const parts = folder.name.split('-');
            const date = parts.length === 4 ? `${parts[1]}/${parts[2]}/${parts[3]}` : folder.name;
            const fileCount = folder.files?.length || 0;
            
            // Extract vendors from result files
            const vendors = new Set<string>();
            folder.files?.forEach((filename: string) => {
              if (filename.includes('_result.csv')) {
                const vendor = filename.split('_')[0].toUpperCase();
                vendors.add(vendor);
                vendorSet.add(vendor); // Add to global vendor set
              }
            });
            
            return {
              jobId: `#${jobId}`,
              date: date,
              files: fileCount,
              vendors: Array.from(vendors)
            };
          });
        
        console.log('📊 Recent Activity:', recentActivity);
        
        // Use folder count for total reconciliations
        const totalRecons = folders.filter((f: any) => f.name !== 'converted').length;
        const vendors = Array.from(vendorSet).sort();
        
        console.log('📊 Vendors found:', vendors);
        
        setStats({
          totalReconciliations: totalRecons,
          vendors: vendors,
          recentActivity: recentActivity
        });
        
        console.log('✅ Stats set successfully with vendors:', vendors);
      } else {
        console.warn('⚠️ API response not success or no data');
        setStats({
          totalReconciliations: 0,
          vendors: [],
          recentActivity: []
        });
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setStats({
        totalReconciliations: 0,
        vendors: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from real data with proper fallbacks
  const totalRecons = stats?.totalReconciliations ?? 0;
  const vendors = stats?.vendors ?? [];
  
  // Recent activity data from backend
  const recentActivity = stats?.recentActivity || [];

  console.log('📊 Dashboard Render Stats:', {
    stats,
    totalRecons,
    vendors,
    recentActivityCount: recentActivity.length,
    recentActivity: recentActivity
  });

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
      title: 'Vendor',
      dataIndex: 'vendors',
      key: 'vendors',
      render: (vendors: string[]) => (
        <Space size={4}>
          {vendors?.map((vendor: string) => (
            <Tag key={vendor} color="blue">{vendor}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Files',
      dataIndex: 'files',
      key: 'files',
      render: (count: number) => <Badge count={count} showZero color="#1890ff" />,
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

  const recentActivityData = recentActivity.map((item: any) => ({
    key: item.jobId,
    jobId: item.jobId,
    date: item.date,
    vendors: item.vendors || [],
    files: item.files,
  }));

  console.log('📋 Recent Activity Data for Table:', recentActivityData);

  // Empty state message
  const emptyText = recentActivity.length === 0 
    ? 'Belum ada aktivitas rekonsiliasi. Mulai proses rekonsiliasi untuk melihat data di sini.' 
    : undefined;

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
        <Col xs={24} sm={12}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Total Rekonsiliasi"
              value={totalRecons}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="List Vendor"
              value={vendors.length}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Space style={{ marginTop: 8 }} wrap>
              {vendors.map((vendor: string) => (
                <Tag key={vendor} color="blue">{vendor}</Tag>
              ))}
              {vendors.length === 0 && <Text type="secondary">Belum ada vendor</Text>}
            </Space>
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
              locale={{ emptyText }}
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