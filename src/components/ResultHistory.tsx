import React, { useState, useEffect } from 'react';
import { Table, Card, Select, Button, Space, Typography, Empty, Tag, message, Tabs, Statistic, Row, Col, Spin, Radio } from 'antd';
import { ReloadOutlined, FolderOpenOutlined, DownloadOutlined, CheckOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface JobFolder {
  name: string;
  files: string[];
}

interface ResultFile {
  filename: string;
  vendor: string;
  type: 'recon' | 'settlement';
}

interface ReconciliationData {
  rrn: string;
  reff: string;
  status: string;
  match_status: string;
  source: string;
  merchant_pan: string;
  merchant_criteria: string;
  invoice_number: string;
  created_date: string;
  created_time: string;
  process_code?: string;
}

interface SettlementData {
  rrn: string;
  reff: string;
  status: string;
  match_status: string;
  merchant_pan: string;
  interchange_fee: string;
  convenience_fee?: string;
}

interface VendorData {
  vendor: string;
  reconData: ReconciliationData[];
  settlementData: SettlementData[];
}

const ResultHistory: React.FC = () => {

  const { theme } = useTheme();
  const [folders, setFolders] = useState<JobFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedJobNumber, setSelectedJobNumber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resultFiles, setResultFiles] = useState<ResultFile[]>([]);
  const [vendorDataList, setVendorDataList] = useState<VendorData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [filterStatus, setFilterStatus] = useState<{ [vendorType: string]: string }>({});

  // Derived state for filters
  const [uniqueJobNumbers, setUniqueJobNumbers] = useState<string[]>([]);
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<JobFolder[]>([]);


  // Helper function untuk mendapatkan warna berdasarkan tema
  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        filterCardBg: '#25254f', // Dark card background
        summaryCardBg: '#2d2d4a', // Summary card background
        successBg: '#162312', // Success background
        warningBg: '#2b2111', // Warning background
        errorBg: '#2f1515', // Error background
      };
    } else {
      return {
        filterCardBg: '#f0f5ff', // Light blue
        summaryCardBg: '#f0f2f5', // Light gray
        successBg: '#f6ffed', // Light green
        warningBg: '#fff7e6', // Light orange
        errorBg: '#fff1f0', // Light red
      };
    }
  };

  const colors = getThemeColors();
  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (folders.length > 0) {
      extractFilters();
      applyFilters();
    }
  }, [folders, selectedJobNumber, selectedDate]);

  useEffect(() => {
    if (selectedFolder) {
      loadResultFiles(selectedFolder);
      loadVendorData(selectedFolder);
    } else {
      setResultFiles([]);
      setVendorDataList([]);
    }
  }, [selectedFolder]);

  const extractJobNumber = (folderName: string) => {
    const parts = folderName.split('-');
    return parts.length > 0 ? parts[0] : folderName;
  };

  const extractDate = (folderName: string) => {
    const parts = folderName.split('-');
    if (parts.length === 4) {
      return `${parts[1]}/${parts[2]}/${parts[3]}`;
    }
    if (folderName.length === 8) {
      const day = folderName.substring(0, 2);
      const month = folderName.substring(2, 4);
      const year = folderName.substring(4, 8);
      return `${day}/${month}/${year}`;
    }
    return folderName;
  };

  const extractFilters = () => {
    const jobNumbers = new Set<string>();
    const dates = new Set<string>();

    folders.forEach((folder) => {
      jobNumbers.add(extractJobNumber(folder.name));
      dates.add(extractDate(folder.name));
    });

    setUniqueJobNumbers(Array.from(jobNumbers).sort());
    setUniqueDates(Array.from(dates).sort());
  };

  const applyFilters = () => {
    let filtered = [...folders];

    if (selectedJobNumber) {
      filtered = filtered.filter(f => extractJobNumber(f.name) === selectedJobNumber);
    }

    if (selectedDate) {
      filtered = filtered.filter(f => extractDate(f.name) === selectedDate);
    }

    setFilteredFolders(filtered);
  };

  const loadFolders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/results');
      if (response.data.success) {
        setFolders(response.data.data || []);
      } else {
        message.error('Gagal memuat daftar folder');
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      message.error('Gagal memuat daftar folder hasil');
    } finally {
      setLoading(false);
    }
  };

  const loadResultFiles = (folderName: string) => {
    const folder = folders.find((f) => f.name === folderName);
    if (!folder) return;

    const files: ResultFile[] = [];
    
    folder.files.forEach((filename) => {
      if (filename.includes('_result.csv')) {
        const parts = filename.replace('_result.csv', '').split('_');
        const vendor = parts[0];
        const type = parts[1] as 'recon' | 'settlement';
        
        files.push({
          filename,
          vendor: vendor.toUpperCase(),
          type,
        });
      }
    });

    setResultFiles(files);
  };

  const loadVendorData = async (folderName: string) => {
    setLoadingData(true);
    const folder = folders.find((f) => f.name === folderName);
    if (!folder) {
      setLoadingData(false);
      return;
    }

    // Group files by vendor
    const vendorFiles: { [vendor: string]: { recon: boolean; settlement: boolean } } = {};
    
    folder.files.forEach((filename) => {
      if (filename.includes('_result.csv')) {
        const parts = filename.replace('_result.csv', '').split('_');
        const vendor = parts[0].toUpperCase();
        const type = parts[1];
        
        if (!vendorFiles[vendor]) {
          vendorFiles[vendor] = { recon: false, settlement: false };
        }
        
        if (type === 'recon') {
          vendorFiles[vendor].recon = true;
        } else if (type === 'settlement') {
          vendorFiles[vendor].settlement = true;
        }
      }
    });

    // Load data for each vendor
    const vendorDataPromises = Object.entries(vendorFiles).map(async ([vendor, types]) => {
      const data: VendorData = {
        vendor,
        reconData: [],
        settlementData: [],
      };

      // Load recon data
      if (types.recon) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/results/${folderName}/${vendor.toLowerCase()}/recon`
          );
          if (response.data.success) {
            data.reconData = response.data.data || [];
          }
        } catch (error) {
          console.error(`Failed to load recon data for ${vendor}:`, error);
        }
      }

      // Load settlement data
      if (types.settlement) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/results/${folderName}/${vendor.toLowerCase()}/settlement`
          );
          if (response.data.success) {
            data.settlementData = response.data.data || [];
          }
        } catch (error) {
          console.error(`Failed to load settlement data for ${vendor}:`, error);
        }
      }

      return data;
    });

    try {
      const allVendorData = await Promise.all(vendorDataPromises);
      setVendorDataList(allVendorData);
    } catch (error) {
      console.error('Error loading vendor data:', error);
      message.error('Gagal memuat data hasil rekonsiliasi');
    } finally {
      setLoadingData(false);
    }
  };

  const handleDownload = (folderName: string, filename: string) => {
    const url = `http://localhost:8080/api/download/${folderName}/${filename}`;
    window.open(url, '_blank');
    message.success(`Downloading ${filename}`);
  };

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

  const downloadTableAsCSV = (vendor: string, type: 'recon' | 'settlement') => {
    const vendorData = vendorDataList.find(v => v.vendor === vendor);
    if (!vendorData) return;

    const data = type === 'recon' ? vendorData.reconData : vendorData.settlementData;
    const filteredData = getFilteredData(data, vendor, type);

    if (filteredData.length === 0) {
      message.warning('Tidak ada data untuk di-download');
      return;
    }

    // Create CSV content
    let csvContent = '';
    
    if (type === 'recon') {
      // Header
      csvContent = 'RRN,Reff,Status,Match Status,Source,Merchant PAN,Merchant Criteria,Invoice Number,Created Date,Created Time,Process Code\n';
      
      // Rows
      filteredData.forEach((row: ReconciliationData) => {
        csvContent += `${row.rrn},${row.reff},${row.status},${row.match_status},${row.source},${row.merchant_pan},${row.merchant_criteria},${row.invoice_number},${row.created_date},${row.created_time},${row.process_code || ''}\n`;
      });
    } else {
      // Header
      csvContent = 'RRN,Reff,Status,Match Status,Merchant PAN,Interchange Fee,Convenience Fee\n';
      
      // Rows
      filteredData.forEach((row: SettlementData) => {
        csvContent += `${row.rrn},${row.reff},${row.status},${row.match_status},${row.merchant_pan},${row.interchange_fee},${row.convenience_fee || ''}\n`;
      });
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filterSuffix = filterStatus[getFilterKey(vendor, type)] && filterStatus[getFilterKey(vendor, type)] !== 'ALL' 
      ? `_${filterStatus[getFilterKey(vendor, type)]}` 
      : '';
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${vendor}_${type}_filtered${filterSuffix}_${selectedFolder}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('File berhasil di-download!');
  };

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
        let icon = <CheckOutlined />;
        if (status === 'ONLY_IN_CORE') {
          color = 'orange';
          icon = <CloseOutlined />;
        } else if (status === 'ONLY_IN_SWITCHING') {
          color = 'red';
          icon = <CloseOutlined />;
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
        let icon = <CheckOutlined />;
        if (status === 'ONLY_IN_CORE') {
          color = 'orange';
          icon = <CloseOutlined />;
        } else if (status === 'ONLY_IN_SWITCHING') {
          color = 'red';
          icon = <CloseOutlined />;
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
      <Title level={2}>Riwayat Hasil Rekonsiliasi</Title>
      <Text type="secondary">
        Pilih tanggal untuk melihat hasil rekonsiliasi
      </Text>

      <Card style={{ marginTop: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Filter Section */}
          <Card size="small" style={{ backgroundColor: colors.filterCardBg }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <FilterOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <Text strong>Filter:</Text>
                
                <Select
                  style={{ width: 150 }}
                  placeholder="Pilih ID"
                  allowClear
                  value={selectedJobNumber || undefined}
                  onChange={(value) => {
                    setSelectedJobNumber(value || '');
                    setSelectedFolder(''); // Reset selection
                  }}
                >
                  {uniqueJobNumbers.map((jobNum) => (
                    <Option key={jobNum} value={jobNum}>
                      #{jobNum}
                    </Option>
                  ))}
                </Select>

                <Select
                  style={{ width: 200 }}
                  placeholder="Pilih Tanggal"
                  allowClear
                  value={selectedDate || undefined}
                  onChange={(value) => {
                    setSelectedDate(value || '');
                    setSelectedFolder(''); // Reset selection
                  }}
                >
                  {uniqueDates.map((date) => (
                    <Option key={date} value={date}>
                      {date}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Space>
          </Card>

          {/* Folder Selection */}
          <div>
            <Space>
              <FolderOpenOutlined style={{ fontSize: 20 }} />
              <Text strong>Pilih Job:</Text>
              <Select
                style={{ width: 400 }}
                placeholder="Pilih folder hasil"
                value={selectedFolder}
                onChange={setSelectedFolder}
                loading={loading}
              >
                {filteredFolders.map((folder) => {
                  const jobNum = extractJobNumber(folder.name);
                  const date = extractDate(folder.name);
                  return (
                    <Option key={folder.name} value={folder.name}>
                      <Space>
                        <Tag color="blue">#{jobNum}</Tag>
                        <span>{date}</span>
                        <Text type="secondary">({folder.files.length} files)</Text>
                      </Space>
                    </Option>
                  );
                })}
              </Select>
              <Button icon={<ReloadOutlined />} onClick={loadFolders}>
                Refresh
              </Button>
            </Space>
          </div>

          {/* Results Table */}
          {selectedFolder ? (
            <div>
              <Title level={4}>
                <Space>
                  <Tag color="blue" style={{ fontSize: 16 }}>#{extractJobNumber(selectedFolder)}</Tag>
                  <span>Hasil Rekonsiliasi - {extractDate(selectedFolder)}</span>
                </Space>
              </Title>
              
              {loadingData ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>
                    <Text>Memuat data hasil rekonsiliasi...</Text>
                  </div>
                </div>
              ) : (
                <>
                  {/* File List Summary with Download Buttons */}
                  {resultFiles.length > 0 && (
                    <Card size="small" style={{ marginBottom: 16, backgroundColor: colors.summaryCardBg }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>📥 Download File Hasil:</Text>
                        <Space wrap>
                          {resultFiles.map((file) => (
                            <Button
                              key={file.filename}
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownload(selectedFolder, file.filename)}
                              type={file.type === 'settlement' ? 'primary' : 'default'}
                            >
                              {file.vendor} {file.type.toUpperCase()} Result
                            </Button>
                          ))}
                        </Space>
                        
                        {/* Download Converted Settlement CSV Files */}
                        {folders.find(f => f.name === selectedFolder)?.files
                          .filter(f => f.includes('_settlement_') && f.endsWith('.csv') && !f.includes('_result.csv'))
                          .map((csvFile) => {
                            const parts = csvFile.split('_');
                            const vendor = parts[0].toUpperCase();
                            return (
                              <Button
                                key={csvFile}
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownload(selectedFolder, csvFile)}
                                type="primary"
                              >
                                {vendor} Settlement Converted CSV
                              </Button>
                            );
                          })}
                      </Space>
                    </Card>
                  )}

                  {/* Vendor Results with Tables */}
                  {vendorDataList.length > 0 ? (
                    vendorDataList.map((vendorData) => (
                      <Card
                        key={vendorData.vendor}
                        title={`Vendor: ${vendorData.vendor}`}
                        style={{ marginBottom: 16 }}
                      >
                        {/* Statistics */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          {vendorData.reconData.length > 0 && (
                            <>
                              <Col xs={24} sm={12} md={6}>
                                <Card size="small" style={{ backgroundColor: colors.successBg }}>
                                  <Statistic
                                    title="Recon Total"
                                    value={vendorData.reconData.length}
                                    valueStyle={{ color: '#1890ff', fontSize: 20 }}
                                  />
                                </Card>
                              </Col>
                              <Col xs={24} sm={12} md={6}>
                                <Card size="small" style={{ backgroundColor: colors.successBg }}>
                                  <Statistic
                                    title="Recon Match"
                                    value={vendorData.reconData.filter(d => d.match_status === 'MATCH').length}
                                    prefix={<CheckOutlined />}
                                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                                  />
                                </Card>
                              </Col>
                              <Col xs={24} sm={12} md={6}>
                                <Card size="small" style={{ backgroundColor: colors.warningBg }}>
                                  <Statistic
                                    title="Only in Core"
                                    value={vendorData.reconData.filter(d => d.match_status === 'ONLY_IN_CORE').length}
                                    prefix={<CloseOutlined />}
                                    valueStyle={{ color: '#faad14', fontSize: 20 }}
                                  />
                                </Card>
                              </Col>
                              <Col xs={24} sm={12} md={6}>
                                <Card size="small" style={{ backgroundColor: colors.errorBg }}>
                                  <Statistic
                                    title="Only in Switching"
                                    value={vendorData.reconData.filter(d => d.match_status === 'ONLY_IN_SWITCHING').length}
                                    prefix={<CloseOutlined />}
                                    valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                                  />
                                </Card>
                              </Col>
                            </>
                          )}
                        </Row>

                        {vendorData.settlementData.length > 0 && (
                          <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col xs={24} sm={12} md={6}>
                              <Card size="small" style={{ backgroundColor: colors.successBg }}>
                                <Statistic
                                  title="Settlement Total"
                                  value={vendorData.settlementData.length}
                                  valueStyle={{ color: '#1890ff', fontSize: 20 }}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Card size="small" style={{ backgroundColor: colors.successBg }}>
                                <Statistic
                                  title="Settlement Match"
                                  value={vendorData.settlementData.filter(d => d.match_status === 'MATCH').length}
                                  prefix={<CheckOutlined />}
                                  valueStyle={{ color: '#52c41a', fontSize: 20 }}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Card size="small" style={{ backgroundColor: colors.warningBg }}>
                                <Statistic
                                  title="Only in Core"
                                  value={vendorData.settlementData.filter(d => d.match_status === 'ONLY_IN_CORE').length}
                                  prefix={<CloseOutlined />}
                                  valueStyle={{ color: '#faad14', fontSize: 20 }}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Card size="small" style={{ backgroundColor: colors.errorBg }}>
                                <Statistic
                                  title="Only in Switching"
                                  value={vendorData.settlementData.filter(d => d.match_status === 'ONLY_IN_SWITCHING').length}
                                  prefix={<CloseOutlined />}
                                  valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                                />
                              </Card>
                            </Col>
                          </Row>
                        )}

                        {/* Tabs for Recon and Settlement */}
                        <Tabs defaultActiveKey="recon">
                          {vendorData.reconData.length > 0 && (
                            <TabPane 
                              tab={`Reconciliation (${vendorData.reconData.length})`} 
                              key="recon"
                            >
                              {/* Filter and Download Controls */}
                              <Space style={{ marginBottom: 16 }} size="middle">
                                <FilterOutlined style={{ fontSize: 16 }} />
                                <Text strong>Filter Status:</Text>
                                <Radio.Group 
                                  value={filterStatus[getFilterKey(vendorData.vendor, 'recon')] || 'ALL'}
                                  onChange={(e) => handleFilterChange(vendorData.vendor, 'recon', e.target.value)}
                                  buttonStyle="solid"
                                >
                                  <Radio.Button value="ALL">All</Radio.Button>
                                  <Radio.Button value="MATCH">
                                    <CheckOutlined /> Match
                                  </Radio.Button>
                                  <Radio.Button value="ONLY_IN_CORE">
                                    <CloseOutlined /> Only in Core
                                  </Radio.Button>
                                  <Radio.Button value="ONLY_IN_SWITCHING">
                                    <CloseOutlined /> Only in Switching
                                  </Radio.Button>
                                </Radio.Group>
                                <Button 
                                  type="primary" 
                                  icon={<DownloadOutlined />}
                                  onClick={() => downloadTableAsCSV(vendorData.vendor, 'recon')}
                                >
                                  Download Filtered Data
                                </Button>
                              </Space>
                              
                              <Table
                                columns={reconColumns}
                                dataSource={getFilteredData(vendorData.reconData, vendorData.vendor, 'recon')}
                                rowKey={(record, index) => `${record.rrn}_${index}`}
                                scroll={{ x: 1500 }}
                                pagination={{ 
                                  pageSize: 10, 
                                  showSizeChanger: true, 
                                  showTotal: (total) => `Total ${total} records` 
                                }}
                              />
                            </TabPane>
                          )}
                          {vendorData.settlementData.length > 0 && (
                            <TabPane 
                              tab={`Settlement (${vendorData.settlementData.length})`} 
                              key="settlement"
                            >
                              {/* Filter and Download Controls */}
                              <Space style={{ marginBottom: 16 }} size="middle">
                                <FilterOutlined style={{ fontSize: 16 }} />
                                <Text strong>Filter Status:</Text>
                                <Radio.Group 
                                  value={filterStatus[getFilterKey(vendorData.vendor, 'settlement')] || 'ALL'}
                                  onChange={(e) => handleFilterChange(vendorData.vendor, 'settlement', e.target.value)}
                                  buttonStyle="solid"
                                >
                                  <Radio.Button value="ALL">All</Radio.Button>
                                  <Radio.Button value="MATCH">
                                    <CheckOutlined /> Match
                                  </Radio.Button>
                                  <Radio.Button value="ONLY_IN_CORE">
                                    <CloseOutlined /> Only in Core
                                  </Radio.Button>
                                  <Radio.Button value="ONLY_IN_SWITCHING">
                                    <CloseOutlined /> Only in Switching
                                  </Radio.Button>
                                </Radio.Group>
                                <Button 
                                  type="primary" 
                                  icon={<DownloadOutlined />}
                                  onClick={() => downloadTableAsCSV(vendorData.vendor, 'settlement')}
                                >
                                  Download Filtered Data
                                </Button>
                              </Space>
                              
                              <Table
                                columns={settlementColumns}
                                dataSource={getFilteredData(vendorData.settlementData, vendorData.vendor, 'settlement')}
                                rowKey={(record, index) => `${record.rrn}_${index}`}
                                scroll={{ x: 1200 }}
                                pagination={{ 
                                  pageSize: 10, 
                                  showSizeChanger: true, 
                                  showTotal: (total) => `Total ${total} records` 
                                }}
                              />
                            </TabPane>
                          )}
                        </Tabs>
                      </Card>
                    ))
                  ) : (
                    <Empty description="Tidak ada data hasil rekonsiliasi" />
                  )}
                </>
              )}
            </div>
          ) : (
            <Empty
              description="Pilih folder untuk melihat hasil"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ResultHistory;
