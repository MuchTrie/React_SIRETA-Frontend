import React from 'react';
import { Card, Statistic, Row, Col, Typography, Button, Space } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ReconciliationResult } from '../types';

const { Title, Text } = Typography;

interface ResultsDisplayProps {
  result: ReconciliationResult;
  onDownload: (url: string) => void;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onDownload, onReset }) => {
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
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                    <Statistic
                      title="Recon Total"
                      value={vendor.recon_results.length}
                      valueStyle={{ color: '#1890ff', fontSize: 20 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                    <Statistic
                      title="Recon Match"
                      value={vendor.recon_match_count}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a', fontSize: 20 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ backgroundColor: '#fff7e6' }}>
                    <Statistic
                      title="Only in Core"
                      value={vendor.recon_results.filter(d => d.match_status === 'ONLY_IN_CORE').length}
                      prefix={<CloseCircleOutlined />}
                      valueStyle={{ color: '#faad14', fontSize: 20 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ backgroundColor: '#fff1f0' }}>
                    <Statistic
                      title="Only in Switching"
                      value={vendor.recon_results.filter(d => d.match_status === 'ONLY_IN_SWITCHING').length}
                      prefix={<CloseCircleOutlined />}
                      valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                    />
                  </Card>
                </Col>
              </>
            )}
          </Row>

          {vendor.settlement_results && vendor.settlement_results.length > 0 && (
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                  <Statistic
                    title="Settlement Total"
                    value={vendor.settlement_results.length}
                    valueStyle={{ color: '#1890ff', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                  <Statistic
                    title="Settlement Match"
                    value={vendor.settlement_match_count}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ backgroundColor: '#fff7e6' }}>
                  <Statistic
                    title="Only in Core"
                    value={vendor.settlement_results.filter(d => d.match_status === 'ONLY_IN_CORE').length}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#faad14', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ backgroundColor: '#fff1f0' }}>
                  <Statistic
                    title="Only in Switching"
                    value={vendor.settlement_results.filter(d => d.match_status === 'ONLY_IN_SWITCHING').length}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Info Message */}
          <Card size="small" style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff', marginTop: 16 }}>
            <Text strong style={{ color: '#1890ff' }}>
              ℹ️ Rekonsiliasi selesai! File hasil telah disimpan. 
              Untuk melihat detail data, silakan buka menu "📊 Riwayat Hasil Rekonsiliasi"
            </Text>
          </Card>
        </Card>
      ))}
    </div>
  );
};

export default ResultsDisplay;
