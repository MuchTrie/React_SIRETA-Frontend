import React, { useState, useEffect } from 'react';
import { Table, Card, Select, Button, Space, Typography, Empty, Tag, message, Tabs, Statistic, Row, Col, Spin, Radio, Modal, Badge, Collapse, Pagination } from 'antd';
import { ReloadOutlined, FolderOpenOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, FilterOutlined, WarningOutlined, FileSearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { reconciliationAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import type { DuplicateReport } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

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
  amount?: number;
  reff: string;
  status: string;
  match_status: string;
  source: string;
  merchant_pan: string;
  interchange_fee: string;
  convenience_fee?: string;
}

interface VendorData {
  vendor: string;
  reconData: ReconciliationData[];
  settlementData: SettlementData[];
  settlementMetadata?: {
    match_count: number;
    mismatch_count: number;
    only_in_core: number;
    only_in_switching: number;
  };
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

  // Derived state for filters
  const [uniqueJobNumbers, setUniqueJobNumbers] = useState<string[]>([]);
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<JobFolder[]>([]);


  // Helper function untuk mendapatkan warna berdasarkan tema
  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        filterCardBg: '#1a1a2e', // Dark card background - konsisten dengan tema
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
      const response = await reconciliationAPI.getResultFolders();
      if (response.success) {
        setFolders(response.data || []);
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
          const response = await reconciliationAPI.getResultData(folderName, vendor.toLowerCase(), 'recon');
          if (response.success) {
            data.reconData = response.data || [];
          }
        } catch (error) {
          console.error(`Failed to load recon data for ${vendor}:`, error);
        }
      }

      // Load settlement data
      if (types.settlement) {
        try {
          const response = await reconciliationAPI.getResultData(folderName, vendor.toLowerCase(), 'settlement');
          if (response.success) {
            // Handling response yang bisa berupa array langsung atau object dengan data + metadata
            if (response.data && typeof response.data === 'object' && 'data' in response.data) {
              data.settlementData = response.data.data || [];
              data.settlementMetadata = response.data.metadata;
            } else {
              data.settlementData = response.data || [];
            }
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

  const handleDownload = async (folderName: string, filename: string) => {
    try {
      message.loading({ content: 'Mengunduh file...', key: 'download' });
      const blob = await reconciliationAPI.downloadResult(folderName, filename);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success({ content: `File ${filename} berhasil di-download!`, key: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      message.error({ content: 'Gagal mengunduh file', key: 'download' });
    }
  };

  // Duplicate detection functions
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
        
        // Log large groups that might cause performance issues
        const checkLargeGroups = (groups: any[], type: string) => {
          groups.forEach((group: any, idx: number) => {
            if (group.records?.length > 20) {
              console.warn(`⚠️ ${type} Group ${idx} has ${group.records.length} records (RRN: ${group.rrn})`);
            }
          });
        };
        
        checkLargeGroups(response.data.core_duplicates, 'CORE');
        checkLargeGroups(response.data.recon_duplicates, 'RECON');
        checkLargeGroups(response.data.settle_duplicates, 'SETTLEMENT');
        
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
        message.error('Gagal memeriksa duplicate');
      }
    } catch (error) {
      console.error('❌ Error checking duplicate:', error);
      message.error('Gagal memeriksa duplicate RRN');
    } finally {
      setLoadingDuplicate(false);
    }
  };

  const handleDownloadDuplicateReport = async () => {
    if (!selectedFolder) return;
    
    try {
      message.loading({ content: 'Mengunduh laporan duplicate...', key: 'download-dup' });
      const blob = await reconciliationAPI.downloadDuplicateReport(selectedFolder);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedFolder}_duplicate_report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success({ content: 'Laporan duplicate berhasil di-download!', key: 'download-dup' });
    } catch (error) {
      console.error('Download duplicate report error:', error);
      message.error({ content: 'Gagal mengunduh laporan duplicate', key: 'download-dup' });
    }
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
  
  const getMatchCountInfo = (vendor: string, type: string) => {
    const vendorData = vendorDataList.find(v => v.vendor === vendor);
    if (!vendorData) return null;
    
    if (type === 'settlement' && vendorData.settlementMetadata) {
      return {
        matchCount: vendorData.settlementMetadata.match_count,
        totalProcessed: vendorData.settlementMetadata.match_count + vendorData.settlementMetadata.mismatch_count
      };
    }
    
    return null;
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
              {selectedFolder && (
                <Button 
                  type="default"
                  danger
                  icon={<FileSearchOutlined />} 
                  onClick={() => handleCheckDuplicate(selectedFolder)}
                  loading={loadingDuplicate}
                >
                  Cek Duplicate RRN
                </Button>
              )}
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
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                                  />
                                </Card>
                              </Col>
                              <Col xs={24} sm={12} md={6}>
                                <Card size="small" style={{ backgroundColor: colors.warningBg }}>
                                  <Statistic
                                    title="Only in Core"
                                    value={vendorData.reconData.filter(d => d.match_status === 'ONLY_IN_CORE').length}
                                    prefix={<CloseCircleOutlined />}
                                    valueStyle={{ color: '#faad14', fontSize: 20 }}
                                  />
                                </Card>
                              </Col>
                              <Col xs={24} sm={12} md={6}>
                                <Card size="small" style={{ backgroundColor: colors.errorBg }}>
                                  <Statistic
                                    title="Only in Switching"
                                    value={vendorData.reconData.filter(d => d.match_status === 'ONLY_IN_SWITCHING').length}
                                    prefix={<CloseCircleOutlined />}
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
                                  value={
                                    vendorData.settlementMetadata 
                                      ? (vendorData.settlementMetadata.match_count + vendorData.settlementMetadata.mismatch_count)
                                      : vendorData.settlementData.length
                                  }
                                  valueStyle={{ color: '#1890ff', fontSize: 20 }}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Card size="small" style={{ backgroundColor: colors.successBg }}>
                                <Statistic
                                  title="Settlement Match"
                                  value={vendorData.settlementMetadata?.match_count || vendorData.settlementData.filter(d => d.match_status === 'MATCH').length}
                                  prefix={<CheckCircleOutlined />}
                                  valueStyle={{ color: '#52c41a', fontSize: 20 }}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Card size="small" style={{ backgroundColor: colors.warningBg }}>
                                <Statistic
                                  title="Only in Core"
                                  value={vendorData.settlementMetadata?.only_in_core || vendorData.settlementData.filter(d => d.match_status === 'ONLY_IN_CORE').length}
                                  prefix={<CloseCircleOutlined />}
                                  valueStyle={{ color: '#faad14', fontSize: 20 }}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Card size="small" style={{ backgroundColor: colors.errorBg }}>
                                <Statistic
                                  title="Only in Switching"
                                  value={vendorData.settlementMetadata?.only_in_switching || vendorData.settlementData.filter(d => d.match_status === 'ONLY_IN_SWITCHING').length}
                                  prefix={<CloseCircleOutlined />}
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
                                    <CheckCircleOutlined /> Match
                                  </Radio.Button>
                                  <Radio.Button value="ONLY_IN_CORE">
                                    <CloseCircleOutlined /> Only in Core
                                  </Radio.Button>
                                  <Radio.Button value="ONLY_IN_SWITCHING">
                                    <CloseCircleOutlined /> Only in Switching
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
                                    <CheckCircleOutlined /> Match
                                  </Radio.Button>
                                  <Radio.Button value="ONLY_IN_CORE">
                                    <CloseCircleOutlined /> Only in Core
                                  </Radio.Button>
                                  <Radio.Button value="ONLY_IN_SWITCHING">
                                    <CloseCircleOutlined /> Only in Switching
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
                              
                              {(() => {
                                const filteredData = getFilteredData(vendorData.settlementData, vendorData.vendor, 'settlement');
                                const currentFilter = filterStatus[getFilterKey(vendorData.vendor, 'settlement')];
                                const matchInfo = getMatchCountInfo(vendorData.vendor, 'settlement');
                                
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
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadDuplicateReport}>
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
                    <Panel 
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
                              // Format YYYYMMDD to DD/MM/YYYY
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
                              // Format HHMMSS to HH:MM:SS
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
                              // Extract from results/job_id/filename
                              const parts = filePath.split('\\');
                              const resultsIndex = parts.findIndex(p => p === 'results');
                              if (resultsIndex >= 0 && parts.length > resultsIndex + 2) {
                                return `${parts[resultsIndex + 1]}/${parts[parts.length - 1]}`;
                              }
                              return parts[parts.length - 1]; // fallback to filename only
                            },
                            ellipsis: true,
                          },
                        ]}
                      />
                    </Panel>
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
                    <Text strong>Reconciliation File Duplicates</Text>
                  </Space>
                } 
                size="small"
              >
                <Collapse accordion destroyInactivePanel>
                  {duplicateReport.recon_duplicates
                    .slice((currentPageRecon - 1) * pageSizeRecon, currentPageRecon * pageSizeRecon)
                    .map((group, idx) => (
                    <Panel 
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
                              // Format YYYYMMDD to DD/MM/YYYY
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
                              // Format HHMMSS to HH:MM:SS
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
                              const parts = filePath.split('\\');
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
                    </Panel>
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
                    <Panel 
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
                              // Format date for settlement: DD/MM/YY to DD/MM/YYYY or YYYYMMDD to DD/MM/YYYY
                              if (!val) return val;
                              // Check if format is DD/MM/YY (e.g., "28/10/25")
                              if (val.includes('/')) {
                                const parts = val.split('/');
                                if (parts.length === 3 && parts[2].length === 2) {
                                  return `${parts[0]}/${parts[1]}/20${parts[2]}`;
                                }
                                return val;
                              }
                              // Check if format is YYYYMMDD
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
                              // Format time: HH:MM:SS (already formatted) or HHMMSS to HH:MM:SS
                              if (!val) return val;
                              // Already has colon separator
                              if (val.includes(':')) return val;
                              // Format HHMMSS to HH:MM:SS
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
                              const parts = filePath.split('\\');
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
                    </Panel>
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

            {/* No Duplicates Found */}
            {duplicateReport.total_duplicates === 0 && (
              <Empty
                image={<CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />}
                description={
                  <Space direction="vertical">
                    <Text strong style={{ fontSize: 16 }}>Tidak Ada Duplicate RRN Terdeteksi!</Text>
                    <Text type="secondary">Semua RRN dalam file adalah unik.</Text>
                  </Space>
                }
              />
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ResultHistory;
