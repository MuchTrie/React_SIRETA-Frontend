import React, { useState } from 'react';
import { Card, Statistic, Row, Col, Typography, Button, Space, Table, Select, Radio, Tag, Modal, message, Badge, Collapse, Pagination, Spin } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined, HistoryOutlined, FilterOutlined, FileSearchOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ReconciliationResult, DuplicateReport } from '../types';
import type { ColumnsType } from 'antd/es/table';
import { useTheme } from '../context/ThemeContext';
import { reconciliationAPI } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface ResultsDisplayProps {
  result: ReconciliationResult;
  onDownload: (url: string) => void;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onDownload, onReset }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<{ [key: string]: string }>({});
  
  // Duplicate detection states
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateReport, setDuplicateReport] = useState<DuplicateReport | null>(null);
  const [loadingDuplicate, setLoadingDuplicate] = useState(false);
  
  // Pagination states for duplicate modal
  const [currentPageCore, setCurrentPageCore] = useState(1);
  const [currentPageRecon, setCurrentPageRecon] = useState(1);
  const [currentPageSettle, setCurrentPageSettle] = useState(1);
  const [pageSizeCore, setPageSizeCore] = useState(5);
  const [pageSizeRecon, setPageSizeRecon] = useState(5);
  const [pageSizeSettle, setPageSizeSettle] = useState(5);

  // Helper function untuk mendapatkan warna berdasarkan tema
  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        successBg: '#162312',
        warningBg: '#2b2111',
        errorBg: '#2f1515',
        infoBg: '#111d2c',
      };
    } else {
      return {
        successBg: '#f6ffed',
        warningBg: '#fff7e6',
        errorBg: '#fff1f0',
        infoBg: '#e6f7ff',
      };
    }
  };

  const colors = getThemeColors();

  // Settlement columns - sama seperti di ResultHistory
  const settlementColumns: ColumnsType<any> = [
    {
      title: 'RRN',
      dataIndex: 'rrn',
      key: 'rrn',
      width: 150,
    },
    {
      title: 'Amount',
      dataIndex: 'settlement_amount',
      key: 'settlement_amount',
      width: 130,
      render: (value: string | number | undefined) => {
        if (value === undefined || value === null || value === '' || value === 0) {
          return '-';
        }
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) {
          return '-';
        }
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 2,
        }).format(numValue);
      },
    },
    {
      title: 'Reff',
      dataIndex: 'reff',
      key: 'reff',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'match_status',
      key: 'match_status',
      width: 200,
      render: (status: string) => {
        if (status === 'ONLY_IN_SWITCHING') {
          return <Tag color="error" icon={<CloseCircleOutlined />}>ONLY IN SWITCHING</Tag>;
        } else if (status === 'ONLY_IN_CORE') {
          return <Tag color="warning" icon={<CloseCircleOutlined />}>ONLY IN CORE</Tag>;
        } else if (status === 'MATCH') {
          return <Tag color="success" icon={<CheckCircleOutlined />}>MATCH</Tag>;
        }
        return <Tag>{status || '-'}</Tag>;
      },
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: string) => (
        <Tag color={source === 'SWITCHING' ? 'purple' : 'blue'}>{source}</Tag>
      ),
    },
    {
      title: 'Merchant PAN',
      dataIndex: 'merchant_pan',
      key: 'merchant_pan',
      width: 180,
    },
    {
      title: 'Interchange Fee',
      dataIndex: 'interchange_fee',
      key: 'interchange_fee',
      width: 130,
    },
    {
      title: 'Convenience Fee',
      dataIndex: 'convenience_fee',
      key: 'convenience_fee',
      width: 130,
      render: (fee: string) => fee || '-',
    },
  ];

  const getFilterKey = (vendor: string, type: string) => {
    return `${vendor}_${type}`;
  };

  const handleFilterChange = (vendor: string, type: string, value: string) => {
    const key = getFilterKey(vendor, type);
    setFilterStatus(prev => ({ ...prev, [key]: value }));
  };

  const getFilteredData = (data: any[], vendor: string, type: string) => {
    const key = getFilterKey(vendor, type);
    const filter = filterStatus[key];
    
    if (!filter || filter === 'ALL') {
      return data;
    }
    
    return data.filter(item => item.match_status === filter);
  };

  const getMatchCountInfo = (vendor: string) => {
    const vendorObj = result.vendors.find(v => v.vendor === vendor);
    if (!vendorObj) {
      return { matchCount: 0, totalProcessed: 0 };
    }
    
    // Gunakan settlement_match_count dan settlement_mismatch_count langsung dari vendor object
    const matchCount = vendorObj.settlement_match_count || 0;
    const mismatchCount = vendorObj.settlement_mismatch_count || 0;
    const totalProcessed = matchCount + mismatchCount;
    
    return { matchCount, totalProcessed };
  };

  const handleCheckDuplicate = async (folderName: string) => {
    setLoadingDuplicate(true);
    try {
      const response = await reconciliationAPI.getDuplicateReport(folderName);
      if (response.success) {
        console.log('📊 Duplicate Report Data:', {
          total_duplicates: response.data.total_duplicates,
          total_records: response.data.total_records,
          core_count: response.data.core_duplicates?.length || 0,
          recon_count: response.data.recon_duplicates?.length || 0,
          settle_count: response.data.settle_duplicates?.length || 0,
        });
        
        // Validate data structure
        if (!response.data.core_duplicates) response.data.core_duplicates = [];
        if (!response.data.recon_duplicates) response.data.recon_duplicates = [];
        if (!response.data.settle_duplicates) response.data.settle_duplicates = [];
        
        setDuplicateReport(response.data);
        
        // Reset pagination
        setCurrentPageCore(1);
        setCurrentPageRecon(1);
        setCurrentPageSettle(1);
        setPageSizeCore(5);
        setPageSizeRecon(5);
        setPageSizeSettle(5);
        
        // Open modal after a small delay to ensure state is set
        setTimeout(() => {
          setShowDuplicateModal(true);
        }, 100);
        
        if (response.data.total_duplicates === 0) {
          message.success('Tidak ada RRN duplicate terdeteksi!');
        } else {
          message.warning(`Ditemukan ${response.data.total_duplicates} RRN duplicate!`);
        }
      } else {
        message.error(response.message || 'Gagal mengecek duplicate RRN');
      }
    } catch (error: any) {
      console.error('Error checking duplicates:', error);
      message.error(error.message || 'Gagal mengecek duplicate RRN');
    } finally {
      setLoadingDuplicate(false);
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Hasil Rekonsiliasi</Title>
          <Text type="secondary">Job ID: {result.job_id}</Text>
        </Col>
        <Col>
          <Space>
            <Button 
              type="primary" 
              icon={<HistoryOutlined />}
              onClick={() => navigate('/riwayat-recon')}
            >
              Lihat Riwayat Detail
            </Button>
            <Button 
              type="default"
              danger
              icon={<FileSearchOutlined />} 
              onClick={() => handleCheckDuplicate(result.job_id)}
              loading={loadingDuplicate}
            >
              Cek Duplicate RRN
            </Button>
            <Button onClick={onReset}>Proses Baru</Button>
          </Space>
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
        >
          {/* Vendor Statistics */}
          {(vendor.settlement_match_count > 0 || vendor.settlement_mismatch_count > 0) && (
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ backgroundColor: colors.successBg }}>
                  <Statistic
                    title="Settlement Total"
                    value={vendor.settlement_match_count + vendor.settlement_mismatch_count}
                    valueStyle={{ color: '#1890ff', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ backgroundColor: colors.successBg }}>
                  <Statistic
                    title="Settlement Match"
                    value={vendor.settlement_match_count || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ backgroundColor: colors.warningBg }}>
                  <Statistic
                    title="Only in Core"
                    value={vendor.settlement_results ? vendor.settlement_results.filter(d => d.match_status === 'ONLY_IN_CORE').length : 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#faad14', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ backgroundColor: colors.errorBg }}>
                  <Statistic
                    title="Only in Switching"
                    value={vendor.settlement_results ? vendor.settlement_results.filter(d => d.match_status === 'ONLY_IN_SWITCHING').length : 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Settlement Table with Filter - sama seperti di ResultHistory */}
          {vendor.settlement_results && vendor.settlement_results.length > 0 && (
            <Card
              title={`Settlement (${vendor.settlement_results.length})`}
              style={{ marginTop: 16 }}
            >
              {/* Filter Controls */}
              <Space style={{ marginBottom: 16 }} size="middle">
                <FilterOutlined style={{ fontSize: 16 }} />
                <Text strong>Filter Status:</Text>
                <Radio.Group 
                  value={filterStatus[getFilterKey(vendor.vendor, 'settlement')] || 'ALL'}
                  onChange={(e) => handleFilterChange(vendor.vendor, 'settlement', e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="ALL">All</Radio.Button>
                  <Radio.Button value="MATCH">
                    <CheckCircleOutlined /> Match
                  </Radio.Button>
                  <Radio.Button value="ONLY_IN_CORE">
                    <CloseCircleOutlined /> Only in Core
                  </Radio.Button>
                  <Radio.Button value="ONLY_IN_SWITCHING">
                    <CloseCircleOutlined /> Only in Switching
                  </Radio.Button>
                </Radio.Group>
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
              
              {(() => {
                const filteredData = getFilteredData(vendor.settlement_results, vendor.vendor, 'settlement');
                const currentFilter = filterStatus[getFilterKey(vendor.vendor, 'settlement')];
                const matchInfo = getMatchCountInfo(vendor.vendor);
                
                // Jika filter MATCH dan data kosong (karena backend tidak mengirim MATCH records)
                if (currentFilter === 'MATCH' && filteredData.length === 0 && matchInfo) {
                  return (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '60px 20px',
                      background: theme === 'dark' 
                        ? 'linear-gradient(135deg, #1a472a 0%, #2d5f3f 100%)'
                        : 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                      borderRadius: '8px',
                      border: theme === 'dark' ? '1px solid #2d5f3f' : '1px solid #c3e6cb',
                      color: theme === 'dark' ? '#95de64' : '#155724'
                    }}>
                      <CheckCircleOutlined style={{ 
                        fontSize: 64, 
                        marginBottom: 16,
                        color: theme === 'dark' ? '#52c41a' : '#28a745'
                      }} />
                      <Title level={3} style={{ 
                        color: theme === 'dark' ? '#95de64' : '#155724', 
                        marginBottom: 8 
                      }}>
                        {matchInfo.matchCount.toLocaleString()} Settlement Records MATCH
                      </Title>                       
                      <div style={{ 
                        marginTop: 20, 
                        fontSize: 14, 
                        color: theme === 'dark' ? 'rgba(149, 222, 100, 0.9)' : '#155724'
                      }}>
                        <p>📊 Total Data Diproses: <strong>{matchInfo.totalProcessed.toLocaleString()}</strong></p>
                        <p>✅ Match: <strong>{matchInfo.matchCount.toLocaleString()}</strong></p>
                        <p>❌ Mismatch: <strong>{(matchInfo.totalProcessed - matchInfo.matchCount).toLocaleString()}</strong></p>
                      </div>
                      <div style={{ marginTop: 24 }}>
                        <Text style={{ 
                          fontSize: 13, 
                          color: theme === 'dark' ? 'rgba(149, 222, 100, 0.7)' : 'rgba(21, 87, 36, 0.8)', 
                          fontStyle: 'italic' 
                        }}>
                          Pilih filter "All", "Only in Core", atau "Only in Switching" untuk melihat data yang tidak match
                        </Text>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <Table
                    columns={settlementColumns}
                    dataSource={filteredData}
                    rowKey={(record, index) => `${record.rrn}_${index}`}
                    scroll={{ x: 1200 }}
                    pagination={{ 
                      pageSize: 10, 
                      showSizeChanger: true, 
                      showTotal: (total) => `Total ${total} records` 
                    }}
                  />
                );
              })()}
            </Card>
          )}
        </Card>
      ))}

      {/* Duplicate Detection Modal */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#ff4d4f' }} />
            <span>Laporan Duplicate RRN Detection</span>
          </Space>
        }
        open={showDuplicateModal}
        onCancel={() => setShowDuplicateModal(false)}
        width={1200}
        footer={[
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={async () => {
              try {
                message.loading({ content: 'Mengunduh laporan duplicate...', key: 'download-dup' });
                const blob = await reconciliationAPI.downloadDuplicateReport(result.job_id);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${result.job_id}_duplicate_report.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                message.success({ content: 'Laporan duplicate berhasil di-download!', key: 'download-dup' });
              } catch (error) {
                console.error('Download duplicate report error:', error);
                message.error({ content: 'Gagal mengunduh laporan duplicate', key: 'download-dup' });
              }
            }}
          >
            Download CSV Report
          </Button>,
          <Button key="close" onClick={() => setShowDuplicateModal(false)}>
            Tutup
          </Button>,
        ]}
      >
        {duplicateReport && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Summary Statistics */}
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Duplicate RRNs"
                    value={duplicateReport.total_duplicates}
                    valueStyle={{ color: duplicateReport.total_duplicates > 0 ? '#ff4d4f' : '#52c41a' }}
                    prefix={duplicateReport.total_duplicates > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Duplicate Records"
                    value={duplicateReport.total_records}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Generated At"
                    value={duplicateReport.generated_at}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* CORE Duplicates */}
            {duplicateReport.core_duplicates && duplicateReport.core_duplicates.length > 0 && (
              <Card 
                title={
                  <Space>
                    <Badge count={duplicateReport.core_duplicates.length} style={{ backgroundColor: '#f5222d' }} />
                    <Text strong>CORE File Duplicates</Text>
                  </Space>
                } 
                size="small"
              >
                <Collapse accordion destroyInactivePanel>
                  {duplicateReport.core_duplicates
                    .slice((currentPageCore - 1) * pageSizeCore, currentPageCore * pageSizeCore)
                    .map((group, idx) => (
                    <Collapse.Panel 
                      key={idx} 
                      header={
                        <Space>
                          <Tag color="red">RRN: {group.rrn}</Tag>
                          <Text strong>Muncul {group.occurrence_count}x</Text>
                          <Text type="secondary">Total: Rp {group.total_amount.toLocaleString()}</Text>
                        </Space>
                      }
                    >
                      <Table
                        size="small"
                        dataSource={group.records}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          pageSizeOptions: ['10', '20', '50'],
                          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} records`
                        }}
                        scroll={{ x: 'max-content' }}
                        columns={[
                          { 
                            title: 'Line #', 
                            dataIndex: 'line_number', 
                            key: 'line', 
                            width: 80,
                            align: 'center' as const,
                          },
                          { 
                            title: 'Vendor', 
                            dataIndex: 'vendor', 
                            key: 'vendor', 
                            width: 100 
                          },
                          { 
                            title: 'Amount', 
                            dataIndex: 'amount', 
                            key: 'amount', 
                            render: (val) => `Rp ${val.toLocaleString()}`, 
                            width: 150,
                            align: 'right' as const,
                          },
                          { 
                            title: 'Date', 
                            dataIndex: 'created_date', 
                            key: 'date', 
                            width: 120,
                            render: (val) => {
                              if (val && val.length === 8) {
                                return `${val.substring(6, 8)}/${val.substring(4, 6)}/${val.substring(0, 4)}`;
                              }
                              return val;
                            }
                          },
                          { 
                            title: 'Time', 
                            dataIndex: 'created_time', 
                            key: 'time', 
                            width: 100,
                            render: (val) => {
                              if (val && val.length === 6) {
                                return `${val.substring(0, 2)}:${val.substring(2, 4)}:${val.substring(4, 6)}`;
                              }
                              return val;
                            }
                          },
                          { 
                            title: 'File', 
                            dataIndex: 'file_name', 
                            key: 'file',
                            render: (filePath: string) => {
                              const parts = filePath.split('\\\\');
                              const resultsIndex = parts.findIndex(p => p === 'results');
                              if (resultsIndex >= 0 && parts.length > resultsIndex + 2) {
                                return `${parts[resultsIndex + 1]}/${parts[parts.length - 1]}`;
                              }
                              return parts[parts.length - 1];
                            },
                            ellipsis: true,
                          },
                        ]}
                      />
                    </Collapse.Panel>
                  ))}
                </Collapse>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Pagination
                    current={currentPageCore}
                    pageSize={pageSizeCore}
                    total={duplicateReport.core_duplicates.length}
                    onChange={(page, pageSize) => {
                      setCurrentPageCore(page);
                      setPageSizeCore(pageSize);
                    }}
                    showSizeChanger
                    showTotal={(total, range) => `${range[0]}-${range[1]} dari ${total} duplicate`}
                    pageSizeOptions={['5', '10', '20', '50']}
                  />
                </div>
              </Card>
            )}

            {/* RECON Duplicates */}
            {duplicateReport.recon_duplicates && duplicateReport.recon_duplicates.length > 0 && (
              <Card 
                title={
                  <Space>
                    <Badge count={duplicateReport.recon_duplicates.length} style={{ backgroundColor: '#fa8c16' }} />
                    <Text strong>Recon File Duplicates</Text>
                  </Space>
                } 
                size="small"
              >
                <Collapse accordion destroyInactivePanel>
                  {duplicateReport.recon_duplicates
                    .slice((currentPageRecon - 1) * pageSizeRecon, currentPageRecon * pageSizeRecon)
                    .map((group, idx) => (
                    <Collapse.Panel 
                      key={idx} 
                      header={
                        <Space>
                          <Tag color="orange">RRN: {group.rrn}</Tag>
                          <Text strong>Muncul {group.occurrence_count}x</Text>
                          <Text type="secondary">Total: Rp {group.total_amount.toLocaleString()}</Text>
                        </Space>
                      }
                    >
                      <Table
                        size="small"
                        dataSource={group.records}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          pageSizeOptions: ['10', '20', '50'],
                          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} records`
                        }}
                        scroll={{ x: 'max-content' }}
                        columns={[
                          { 
                            title: 'Line #', 
                            dataIndex: 'line_number', 
                            key: 'line', 
                            width: 80,
                            align: 'center' as const,
                          },
                          { 
                            title: 'Vendor', 
                            dataIndex: 'vendor', 
                            key: 'vendor', 
                            width: 100 
                          },
                          { 
                            title: 'Amount', 
                            dataIndex: 'amount', 
                            key: 'amount', 
                            render: (val) => `Rp ${val.toLocaleString()}`, 
                            width: 150,
                            align: 'right' as const,
                          },
                          { 
                            title: 'Date', 
                            dataIndex: 'created_date', 
                            key: 'date', 
                            width: 120,
                            render: (val) => {
                              if (val && val.length === 8) {
                                return `${val.substring(6, 8)}/${val.substring(4, 6)}/${val.substring(0, 4)}`;
                              }
                              return val;
                            }
                          },
                          { 
                            title: 'Time', 
                            dataIndex: 'created_time', 
                            key: 'time', 
                            width: 100,
                            render: (val) => {
                              if (val && val.length === 6) {
                                return `${val.substring(0, 2)}:${val.substring(2, 4)}:${val.substring(4, 6)}`;
                              }
                              return val;
                            }
                          },
                          { 
                            title: 'File', 
                            dataIndex: 'file_name', 
                            key: 'file',
                            render: (filePath: string) => {
                              const parts = filePath.split('\\\\');
                              const resultsIndex = parts.findIndex(p => p === 'results');
                              if (resultsIndex >= 0 && parts.length > resultsIndex + 2) {
                                return `${parts[resultsIndex + 1]}/${parts[parts.length - 1]}`;
                              }
                              return parts[parts.length - 1];
                            },
                            ellipsis: true,
                          },
                        ]}
                      />
                    </Collapse.Panel>
                  ))}
                </Collapse>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Pagination
                    current={currentPageRecon}
                    pageSize={pageSizeRecon}
                    total={duplicateReport.recon_duplicates.length}
                    onChange={(page, pageSize) => {
                      setCurrentPageRecon(page);
                      setPageSizeRecon(pageSize);
                    }}
                    showSizeChanger
                    showTotal={(total, range) => `${range[0]}-${range[1]} dari ${total} duplicate`}
                    pageSizeOptions={['5', '10', '20', '50']}
                  />
                </div>
              </Card>
            )}

            {/* SETTLEMENT Duplicates */}
            {duplicateReport.settle_duplicates && duplicateReport.settle_duplicates.length > 0 && (
              <Card 
                title={
                  <Space>
                    <Badge count={duplicateReport.settle_duplicates.length} style={{ backgroundColor: '#1890ff' }} />
                    <Text strong>Settlement File Duplicates</Text>
                  </Space>
                } 
                size="small"
              >
                <Collapse accordion destroyInactivePanel>
                  {duplicateReport.settle_duplicates
                    .slice((currentPageSettle - 1) * pageSizeSettle, currentPageSettle * pageSizeSettle)
                    .map((group, idx) => (
                    <Collapse.Panel 
                      key={idx} 
                      header={
                        <Space>
                          <Tag color="blue">RRN: {group.rrn}</Tag>
                          <Text strong>Muncul {group.occurrence_count}x</Text>
                          <Text type="secondary">Total: Rp {group.total_amount.toLocaleString()}</Text>
                        </Space>
                      }
                    >
                      <Table
                        size="small"
                        dataSource={group.records}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          pageSizeOptions: ['10', '20', '50'],
                          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} records`
                        }}
                        scroll={{ x: 'max-content' }}
                        columns={[
                          { 
                            title: 'Line #', 
                            dataIndex: 'line_number', 
                            key: 'line', 
                            width: 80,
                            align: 'center' as const,
                          },
                          { 
                            title: 'Vendor', 
                            dataIndex: 'vendor', 
                            key: 'vendor', 
                            width: 100 
                          },
                          { 
                            title: 'Amount', 
                            dataIndex: 'amount', 
                            key: 'amount', 
                            render: (val) => `Rp ${val.toLocaleString()}`, 
                            width: 150,
                            align: 'right' as const,
                          },
                          { 
                            title: 'Date', 
                            dataIndex: 'created_date', 
                            key: 'date', 
                            width: 120,
                            render: (val) => {
                              if (!val) return val;
                              if (val.includes('/')) {
                                const parts = val.split('/');
                                if (parts.length === 3 && parts[2].length === 2) {
                                  return `${parts[0]}/${parts[1]}/20${parts[2]}`;
                                }
                                return val;
                              }
                              if (val.length === 8) {
                                return `${val.substring(6, 8)}/${val.substring(4, 6)}/${val.substring(0, 4)}`;
                              }
                              return val;
                            }
                          },
                          { 
                            title: 'Time', 
                            dataIndex: 'created_time', 
                            key: 'time', 
                            width: 100,
                            render: (val) => {
                              if (!val) return val;
                              if (val.includes(':')) return val;
                              if (val.length === 6) {
                                return `${val.substring(0, 2)}:${val.substring(2, 4)}:${val.substring(4, 6)}`;
                              }
                              return val;
                            }
                          },
                          { 
                            title: 'File', 
                            dataIndex: 'file_name', 
                            key: 'file',
                            render: (filePath: string) => {
                              const parts = filePath.split('\\\\');
                              const resultsIndex = parts.findIndex(p => p === 'results');
                              if (resultsIndex >= 0 && parts.length > resultsIndex + 2) {
                                return `${parts[resultsIndex + 1]}/${parts[parts.length - 1]}`;
                              }
                              return parts[parts.length - 1];
                            },
                            ellipsis: true,
                          },
                        ]}
                      />
                    </Collapse.Panel>
                  ))}
                </Collapse>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Pagination
                    current={currentPageSettle}
                    pageSize={pageSizeSettle}
                    total={duplicateReport.settle_duplicates.length}
                    onChange={(page, pageSize) => {
                      setCurrentPageSettle(page);
                      setPageSizeSettle(pageSize);
                    }}
                    showSizeChanger
                    showTotal={(total, range) => `${range[0]}-${range[1]} dari ${total} duplicate`}
                    pageSizeOptions={['5', '10', '20', '50']}
                  />
                </div>
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ResultsDisplay;
