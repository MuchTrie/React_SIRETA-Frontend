import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Empty, Spin, message } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const { Title, Text } = Typography;

interface JobFolder {
  name: string;
  files: string[];
}

interface DashboardStats {
  totalJobs: number;
  totalResultFiles: number;
  latestJob: string | null;
  vendors: { [key: string]: number };
}

interface JobSummary {
  key: string;
  jobId: string;
  jobNumber: string;  // Tambahan untuk nomor ID saja
  date: string;
  vendors: string[];
  fileCount: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalResultFiles: 0,
    latestJob: null,
    vendors: {},
  });
  const [jobSummaries, setJobSummaries] = useState<JobSummary[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/results');
      if (response.data.success) {
        const folders: JobFolder[] = response.data.data || [];
        processData(folders);
      } else {
        message.error('Gagal memuat data dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      message.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const processData = (folders: JobFolder[]) => {
    const vendorCounts: { [key: string]: number } = {};
    let totalFiles = 0;
    const summaries: JobSummary[] = [];

    // Sort folders by date (newest first)
    const sortedFolders = [...folders].sort((a, b) => b.name.localeCompare(a.name));

    sortedFolders.forEach((folder) => {
      const vendors = new Set<string>();
      let resultFileCount = 0;

      folder.files.forEach((filename) => {
        if (filename.includes('_result.csv')) {
          totalFiles++;
          resultFileCount++;
          
          // Extract vendor name
          const parts = filename.split('_');
          if (parts.length > 0) {
            const vendor = parts[0].toUpperCase();
            vendors.add(vendor);
            vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;
          }
        }
      });

      summaries.push({
        key: folder.name,
        jobId: folder.name,
        jobNumber: extractJobNumber(folder.name),
        date: formatDate(folder.name),
        vendors: Array.from(vendors),
        fileCount: resultFileCount,
      });
    });

    setStats({
      totalJobs: folders.length,
      totalResultFiles: totalFiles,
      latestJob: sortedFolders.length > 0 ? sortedFolders[0].name : null,
      vendors: vendorCounts,
    });

    setJobSummaries(summaries);
  };

  const extractJobNumber = (folderName: string) => {
    // Format: XXXX-DD-MM-YYYY, extract XXXX
    const parts = folderName.split('-');
    return parts.length > 0 ? parts[0] : folderName;
  };

  const formatDate = (folderName: string) => {
    // Format: XXXX-DD-MM-YYYY, extract DD-MM-YYYY
    const parts = folderName.split('-');
    if (parts.length === 4) {
      return `${parts[1]}/${parts[2]}/${parts[3]}`;
    }
    // Legacy format DDMMYYYY
    if (folderName.length === 8) {
      const day = folderName.substring(0, 2);
      const month = folderName.substring(2, 4);
      const year = folderName.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return folderName;
  };

  const columns: ColumnsType<JobSummary> = [
    {
      title: 'ID',
      dataIndex: 'jobNumber',
      key: 'jobNumber',
      width: 100,
      render: (jobNumber: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 14 }}>
          #{jobNumber}
        </Tag>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {date}
        </span>
      ),
    },
    {
      title: 'Vendors',
      dataIndex: 'vendors',
      key: 'vendors',
      render: (vendors: string[]) => (
        <>
          {vendors.map((vendor) => (
            <Tag color="green" key={vendor} style={{ marginBottom: 4 }}>
              {vendor}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Total Files',
      dataIndex: 'fileCount',
      key: 'fileCount',
      align: 'center',
      render: (count: number) => (
        <Tag color="orange" icon={<FileTextOutlined />}>
          {count} files
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Memuat data dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>📊 Dashboard Rekonsiliasi</Title>
      <Text type="secondary">
        Overview hasil rekonsiliasi switching
      </Text>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Jobs"
              value={stats.totalJobs}
              prefix={<FolderOpenOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Result Files"
              value={stats.totalResultFiles}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Latest Job"
              value={stats.latestJob ? formatDate(stats.latestJob) : '-'}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Unique Vendors"
              value={Object.keys(stats.vendors).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Vendor Distribution */}
      {Object.keys(stats.vendors).length > 0 && (
        <Card title="Distribusi Vendor" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {Object.entries(stats.vendors).map(([vendor, count]) => (
              <Col xs={12} sm={8} md={6} key={vendor}>
                <Card size="small">
                  <Statistic
                    title={vendor}
                    value={count}
                    suffix="files"
                    valueStyle={{ color: '#1890ff', fontSize: 18 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Job Summary Table */}
      <Card title="Riwayat Job Rekonsiliasi">
        {jobSummaries.length > 0 ? (
          <Table
            columns={columns}
            dataSource={jobSummaries}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} jobs`,
            }}
          />
        ) : (
          <Empty
            description="Belum ada data rekonsiliasi"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
