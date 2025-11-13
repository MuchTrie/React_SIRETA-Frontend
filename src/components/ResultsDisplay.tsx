import { Card, Table, Tag, Statistic, Row, Col, Typography, Tabs, Button, Space } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ReconciliationResult, ReconciliationData, SettlementData } from '../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ResultsDisplayProps {
  result: ReconciliationResult;
  onDownload: (url: string) => void;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onDownload, onReset }) => {
  // Columns for reconciliation table
  const reconColumns: ColumnsType<ReconciliationData> = [
    {
      title: 'RRN',
      dataIndex: 'rrn',
      key: 'rrn',
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Reff',
      dataIndex: 'reff',
      key: 'reff',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'match_status',
      key: 'match_status',
      width: 150,
      render: (status: string) => {
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        if (status === 'ONLY_IN_CORE') {
          color = 'orange';
          icon = <CloseCircleOutlined />;
        } else if (status === 'ONLY_IN_SWITCHING') {
          color = 'red';
          icon = <CloseCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {status.replace(/_/g, ' ')}
          </Tag>
        );
      },
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => (
        <Tag color={source === 'BOTH' ? 'blue' : source === 'CORE' ? 'cyan' : 'purple'}>
          {source}
        </Tag>
      ),
    },
    {
      title: 'Merchant PAN',
      dataIndex: 'merchant_pan',
      key: 'merchant_pan',
      width: 150,
    },
    {
      title: 'Merchant Criteria',
      dataIndex: 'merchant_criteria',
      key: 'merchant_criteria',
      width: 150,
    },
    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      width: 150,
    },
    {
      title: 'Created Date',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 120,
    },
    {
      title: 'Created Time',
      dataIndex: 'created_time',
      key: 'created_time',
      width: 120,
    },
    {
      title: 'Process Code',
      dataIndex: 'process_code',
      key: 'process_code',
      width: 120,
    },
  ];

  // Columns for settlement table
  const settlementColumns: ColumnsType<SettlementData> = [
    {
      title: 'RRN',
      dataIndex: 'rrn',
      key: 'rrn',
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Reff',
      dataIndex: 'reff',
      key: 'reff',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'match_status',
      key: 'match_status',
      width: 150,
      render: (status: string) => {
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        if (status === 'ONLY_IN_CORE') {
          color = 'orange';
          icon = <CloseCircleOutlined />;
        } else if (status === 'ONLY_IN_SWITCHING') {
          color = 'red';
          icon = <CloseCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {status.replace(/_/g, ' ')}
          </Tag>
        );
      },
    },
    {
      title: 'Merchant PAN',
      dataIndex: 'merchant_pan',
      key: 'merchant_pan',
      width: 150,
    },
    {
      title: 'Interchange Fee',
      dataIndex: 'interchange_fee',
      key: 'interchange_fee',
      width: 150,
    },
    {
      title: 'Convenience Fee',
      dataIndex: 'convenience_fee',
      key: 'convenience_fee',
      width: 150,
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Hasil Rekonsiliasi</Title>
          <Text type="secondary">Job ID: {result.job_id}</Text>
        </Col>
        <Col>
          <Button onClick={onReset}>Proses Baru</Button>
        </Col>
      </Row>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Records"
              value={result.total_records}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vendors Processed"
              value={result.vendors.length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Status"
              value={result.status.toUpperCase()}
              valueStyle={{ color: result.status === 'completed' ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Processed At"
              value={new Date(result.processed_at).toLocaleString('id-ID')}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Vendor Results */}
      {result.vendors.map((vendor) => (
        <Card
          key={vendor.vendor}
          title={`Vendor: ${vendor.vendor.toUpperCase()}`}
          style={{ marginBottom: 16 }}
          extra={
            <Space>
              {result.download_urls && result.download_urls[`${vendor.vendor}_recon_result`] && (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => onDownload(result.download_urls![`${vendor.vendor}_recon_result`])}
                >
                  Download Recon Result
                </Button>
              )}
              {result.download_urls && result.download_urls[`${vendor.vendor}_settlement_result`] && (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => onDownload(result.download_urls![`${vendor.vendor}_settlement_result`])}
                >
                  Download Settlement Result
                </Button>
              )}
            </Space>
          }
        >
          {/* Vendor Statistics */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            {vendor.recon_results && vendor.recon_results.length > 0 && (
              <>
                <Col span={6}>
                  <Statistic
                    title="Recon Match"
                    value={vendor.recon_match_count}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Recon Mismatch"
                    value={vendor.recon_mismatch_count}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
              </>
            )}
            {vendor.settlement_results && vendor.settlement_results.length > 0 && (
              <>
                <Col span={6}>
                  <Statistic
                    title="Settlement Match"
                    value={vendor.settlement_match_count}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Settlement Mismatch"
                    value={vendor.settlement_mismatch_count}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
              </>
            )}
          </Row>

          {/* Tabs for Recon and Settlement */}
          <Tabs defaultActiveKey="recon">
            {vendor.recon_results && vendor.recon_results.length > 0 && (
              <TabPane tab={`Reconciliation (${vendor.recon_results.length})`} key="recon">
                <Table
                  columns={reconColumns}
                  dataSource={vendor.recon_results}
                  rowKey="rrn"
                  scroll={{ x: 1500 }}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} records` }}
                />
              </TabPane>
            )}
            {vendor.settlement_results && vendor.settlement_results.length > 0 && (
              <TabPane tab={`Settlement (${vendor.settlement_results.length})`} key="settlement">
                <Table
                  columns={settlementColumns}
                  dataSource={vendor.settlement_results}
                  rowKey="rrn"
                  scroll={{ x: 1200 }}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} records` }}
                />
              </TabPane>
            )}
          </Tabs>
        </Card>
      ))}
    </div>
  );
};

export default ResultsDisplay;
