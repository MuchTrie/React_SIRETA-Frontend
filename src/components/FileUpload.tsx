import React, { useState } from 'react';
import { Upload, Button, Card, Row, Col, Typography, Divider, Alert, Tag, Space, Progress, Modal, message } from 'antd';
import { 
  InboxOutlined, 
  FileTextOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  BarChartOutlined,
  DeleteOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { useTheme } from '../context/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface FileUploadProps {
  onUpload: (files: Record<string, File | File[]>) => void;
  loading: boolean;
  uploadProgress?: number;
  processingStage?: string;
}

// Vendor detection helper - deteksi berdasarkan nama atau kode vendor
const detectVendor = (filename: string): string | null => {
  const name = filename.toLowerCase();
  
  // Deteksi berdasarkan kode vendor (untuk file recon/settlement)
  if (name.includes('360004')) return 'jalin';  // JALIN code
  if (name.includes('360003')) return 'alto';   // ALTO code
  if (name.includes('360002')) return 'rinti';  // RINTIS code
  if (name.includes('360001')) return 'aj';     // ARTAJASA code
  
  // Deteksi berdasarkan nama vendor (untuk file core atau file dengan nama vendor)
  if (name.includes('jalin')) return 'jalin';
  if (name.includes('alto')) return 'alto';
  if (name.includes('aj')) return 'aj';
  if (name.includes('artajasa')) return 'aj';
  if (name.includes('rinti')) return 'rinti';
  if (name.includes('rintis')) return 'rinti';
  
  return null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, loading, uploadProgress, processingStage }) => {
  const { theme } = useTheme();
  const [coreFiles, setCoreFiles] = useState<UploadFile[]>([]);
  const [reconFiles, setReconFiles] = useState<UploadFile[]>([]);
  const [settlementFiles, setSettlementFiles] = useState<UploadFile[]>([]);
  const [isDraggingCore, setIsDraggingCore] = useState(false);
  const [isDraggingRecon, setIsDraggingRecon] = useState(false);
  const [isDraggingSettlement, setIsDraggingSettlement] = useState(false);

  // Helper function untuk mendapatkan warna berdasarkan tema
  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        infoBg: '#1a1a2e',
        summaryBg: '#2d2d4a',
      };
    } else {
      return {
        infoBg: '#f5f5f5',
        summaryBg: '#fafafa',
      };
    }
  };

  const colors = getThemeColors();

  // Auto-categorize files by vendor
  const categorizeFilesByVendor = (files: UploadFile[]): Record<string, UploadFile[]> => {
    const categorized: Record<string, UploadFile[]> = {
      alto: [],
      jalin: [],
      aj: [],
      rinti: [],
      unknown: []
    };

    files.forEach(file => {
      const vendor = detectVendor(file.name);
      if (vendor) {
        categorized[vendor].push(file);
      } else {
        categorized.unknown.push(file);
      }
    });

    return categorized;
  };

  const reconByVendor = categorizeFilesByVendor(reconFiles);
  const settlementByVendor = categorizeFilesByVendor(settlementFiles);

  const handleSubmit = () => {
    const files: Record<string, File | File[]> = {};
    
    // Core files
    if (coreFiles.length > 0) {
      files.coreFiles = coreFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    
    // Vendor recon files
    if (reconByVendor.alto.length > 0) {
      files.altoReconFiles = reconByVendor.alto.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (reconByVendor.jalin.length > 0) {
      files.jalinReconFiles = reconByVendor.jalin.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (reconByVendor.aj.length > 0) {
      files.ajReconFiles = reconByVendor.aj.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (reconByVendor.rinti.length > 0) {
      files.rintiReconFiles = reconByVendor.rinti.map(f => f.originFileObj as File).filter(Boolean);
    }

    // Vendor settlement files
    if (settlementByVendor.alto.length > 0) {
      files.altoSettlementFiles = settlementByVendor.alto.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (settlementByVendor.jalin.length > 0) {
      files.jalinSettlementFiles = settlementByVendor.jalin.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (settlementByVendor.aj.length > 0) {
      files.ajSettlementFiles = settlementByVendor.aj.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (settlementByVendor.rinti.length > 0) {
      files.rintiSettlementFiles = settlementByVendor.rinti.map(f => f.originFileObj as File).filter(Boolean);
    }
    
    onUpload(files);
  };

  const hasVendorFiles = reconFiles.length > 0 || settlementFiles.length > 0;
  const canSubmit = coreFiles.length > 0 && hasVendorFiles && !loading;

  const getVendorColor = (vendor: string) => {
    const colors: Record<string, string> = {
      alto: 'blue',
      jalin: 'green',
      aj: 'orange',
      rinti: 'purple',
      unknown: 'red'
    };
    return colors[vendor] || 'default';
  };

  const renderFilesByVendor = (categorized: Record<string, UploadFile[]>) => {
    return Object.entries(categorized).map(([vendor, files]) => {
      if (files.length === 0) return null;
      return (
        <div key={vendor} style={{ marginBottom: 8 }}>
          <Tag color={getVendorColor(vendor)} style={{ marginRight: 8 }}>
            {vendor.toUpperCase()}
          </Tag>
          <Text type="secondary">{files.length} file(s)</Text>
        </div>
      );
    });
  };

  // Clear all files
  const clearAllFiles = () => {
    Modal.confirm({
      title: 'Hapus Semua File?',
      content: 'Apakah Anda yakin ingin menghapus semua file yang sudah diupload?',
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        setCoreFiles([]);
        setReconFiles([]);
        setSettlementFiles([]);
        message.success('Semua file berhasil dihapus');
      },
    });
  };

  // Enhanced upload props untuk better drag & drop experience
  const getUploadProps = (
    fileList: UploadFile[],
    setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>,
    _isDragging: boolean,
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>,
    acceptTypes?: string
  ): UploadProps => {
    // Track processed files untuk avoid duplicate
    const processedBatch = React.useRef<Set<string>>(new Set());

    return {
      multiple: true,
      accept: acceptTypes,
      fileList,
      beforeUpload: (_file: RcFile, files: RcFile[]) => {
        // Generate batch ID untuk track
        const batchId = files.map(f => f.name).sort().join('|');
        
        // Jika batch ini sudah diproses, skip
        if (processedBatch.current.has(batchId)) {
          return false;
        }
        
        // Mark batch sebagai processed
        processedBatch.current.add(batchId);
        
        // Add semua files dari batch
        const newFiles: UploadFile[] = files.map((f) => ({
          uid: f.name + Date.now() + Math.random(),
          name: f.name,
          size: f.size,
          type: f.type,
          originFileObj: f,
        }));
        
        setFileList((prev) => [...prev, ...newFiles]);
        message.success(`${files.length} file berhasil ditambahkan`);
        
        // Clear processed batch setelah delay
        setTimeout(() => {
          processedBatch.current.clear();
        }, 1000);
        
        return false;
      },
      onRemove: (file) => {
        setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        message.info('File dihapus');
      },
      onDrop: (e) => {
        console.log('Dropped files', e.dataTransfer.files);
        setIsDragging(false);
      },
      showUploadList: {
        showRemoveIcon: true,
        removeIcon: <DeleteOutlined style={{ color: 'red' }} />,
      },
      listType: 'text',
    };
  };

  return (
    <div>
      <Title level={2}>
        <CloudUploadOutlined /> Upload File Rekonsiliasi
      </Title>
      
      <Alert
        message="🎯 Cara Penggunaan - Drag & Drop Multiple Files"
        description={
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              1. <strong>Drag & drop</strong> atau klik untuk upload <strong>CORE file(s)</strong> (wajib) - bisa sekaligus banyak file<br />
              2. <strong>Drag & drop</strong> file <strong>Reconciliation</strong> - nama file harus mengandung vendor (ALTO/JALIN/AJ/RINTI)<br />
              3. <strong>Drag & drop</strong> file <strong>Settlement</strong> - nama file harus mengandung vendor (ALTO/JALIN/AJ/RINTI)<br />
              4. Klik <strong>Proses Rekonsiliasi</strong>
            </Paragraph>
            <div>
              <Tag color="blue" icon={<FileAddOutlined />}>Multiple files sekaligus</Tag>
              <Tag color="green">Auto-detect vendor dari nama file</Tag>
              <Tag color="orange">CSV/TXT/BIN semua support</Tag>
            </div>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {(coreFiles.length > 0 || reconFiles.length > 0 || settlementFiles.length > 0) && (
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={clearAllFiles}
            size="small"
          >
            Hapus Semua File
          </Button>
        </div>
      )}

      {/* CORE FILES */}
      <Card 
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <Text strong>CORE Files (Wajib)</Text>
            {coreFiles.length > 0 && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                {coreFiles.length} file(s)
              </Tag>
            )}
          </Space>
        }
        style={{ 
          marginBottom: 16,
          border: isDraggingCore ? '2px dashed #1890ff' : undefined,
          boxShadow: isDraggingCore ? '0 0 10px rgba(24, 144, 255, 0.3)' : undefined,
        }}
      >
        <Dragger
          {...getUploadProps(coreFiles, setCoreFiles, isDraggingCore, setIsDraggingCore, '.csv')}
          style={{
            background: isDraggingCore ? 'rgba(24, 144, 255, 0.05)' : undefined,
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1890ff', fontSize: isDraggingCore ? 60 : 48 }} />
          </p>
          <p className="ant-upload-text" style={{ fontWeight: isDraggingCore ? 'bold' : 'normal' }}>
            {isDraggingCore ? '📥 Drop files di sini!' : 'Drag & Drop CORE files (bisa multiple sekaligus)'}
          </p>
          <p className="ant-upload-hint">
            Support: CSV files | Bisa drop banyak file sekaligus | Klik untuk browse
          </p>
        </Dragger>
      </Card>

      <Row gutter={16}>
        {/* RECONCILIATION FILES */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FileTextOutlined style={{ color: '#52c41a' }} />
                <Text strong>Reconciliation Files</Text>
                {reconFiles.length > 0 && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    {reconFiles.length} file(s)
                  </Tag>
                )}
              </Space>
            }
            style={{ 
              marginBottom: 16, 
              height: '100%',
              border: isDraggingRecon ? '2px dashed #52c41a' : undefined,
              boxShadow: isDraggingRecon ? '0 0 10px rgba(82, 196, 26, 0.3)' : undefined,
            }}
          >
            <Dragger
              {...getUploadProps(reconFiles, setReconFiles, isDraggingRecon, setIsDraggingRecon)}
              style={{ 
                minHeight: 220,
                background: isDraggingRecon ? 'rgba(82, 196, 26, 0.05)' : undefined,
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#52c41a', fontSize: isDraggingRecon ? 60 : 48 }} />
              </p>
              <p className="ant-upload-text" style={{ fontWeight: isDraggingRecon ? 'bold' : 'normal' }}>
                {isDraggingRecon ? '📥 Drop files di sini!' : 'Drag & Drop Reconciliation files'}
              </p>
              <p className="ant-upload-hint">
                CSV/TXT/File tanpa ekstensi | Multiple files OK | Auto-detect vendor
              </p>
            </Dragger>

            {reconFiles.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: colors.infoBg, borderRadius: 4 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Auto-Detected:</Text>
                {renderFilesByVendor(reconByVendor)}
                {reconByVendor.unknown.length > 0 && (
                  <Alert
                    message="⚠️ File tidak terdeteksi vendornya"
                    description="Pastikan nama file mengandung: ALTO, JALIN, AJ, atau RINTI"
                    type="warning"
                    showIcon
                    closable
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* SETTLEMENT FILES */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <DollarOutlined style={{ color: '#fa8c16' }} />
                <Text strong>Settlement Files</Text>
                {settlementFiles.length > 0 && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    {settlementFiles.length} file(s)
                  </Tag>
                )}
              </Space>
            }
            style={{ 
              marginBottom: 16, 
              height: '100%',
              border: isDraggingSettlement ? '2px dashed #fa8c16' : undefined,
              boxShadow: isDraggingSettlement ? '0 0 10px rgba(250, 140, 22, 0.3)' : undefined,
            }}
          >
            <Dragger
              {...getUploadProps(settlementFiles, setSettlementFiles, isDraggingSettlement, setIsDraggingSettlement)}
              style={{ 
                minHeight: 220,
                background: isDraggingSettlement ? 'rgba(250, 140, 22, 0.05)' : undefined,
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#fa8c16', fontSize: isDraggingSettlement ? 60 : 48 }} />
              </p>
              <p className="ant-upload-text" style={{ fontWeight: isDraggingSettlement ? 'bold' : 'normal' }}>
                {isDraggingSettlement ? '📥 Drop files di sini!' : 'Drag & Drop Settlement files'}
              </p>
              <p className="ant-upload-hint">
                CSV/TXT/BIN/File tanpa ekstensi | Multiple files | Auto-detect vendor
              </p>
            </Dragger>

            {settlementFiles.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: colors.infoBg, borderRadius: 4 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Auto-Detected:</Text>
                {renderFilesByVendor(settlementByVendor)}
                {settlementByVendor.unknown.length > 0 && (
                  <Alert
                    message="⚠️ File tidak terdeteksi vendornya"
                    description="Pastikan nama file mengandung: ALTO, JALIN, AJ, atau RINTI"
                    type="warning"
                    showIcon
                    closable
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Summary Section */}
      {(coreFiles.length > 0 || hasVendorFiles) && (
        <Card 
          title={
            <Space>
              <BarChartOutlined style={{ color: '#722ed1' }} />
              <Text strong>Summary Upload</Text>
            </Space>
          }
          style={{ marginBottom: 16, background: colors.summaryBg }}
          size="small"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Text type="secondary">Core Files:</Text>
              <div>
                <Text strong style={{ fontSize: 18 }}>{coreFiles.length}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Reconciliation Files:</Text>
              <div>
                <Text strong style={{ fontSize: 18 }}>{reconFiles.length}</Text>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Settlement Files:</Text>
              <div>
                <Text strong style={{ fontSize: 18 }}>{settlementFiles.length}</Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Button
        type="primary"
        size="large"
        block
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={loading}
        icon={<CloudUploadOutlined />}
      >
        {loading ? 'Memproses Rekonsiliasi...' : 'Proses Rekonsiliasi'}
      </Button>

      {!canSubmit && (coreFiles.length === 0 || !hasVendorFiles) && (
        <Alert
          message="Belum bisa diproses"
          description={
            <div>
              {coreFiles.length === 0 && <div>• Upload minimal 1 CORE file</div>}
              {!hasVendorFiles && <div>• Upload minimal 1 file Reconciliation atau Settlement</div>}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {/* Loading Progress Modal */}
      <Modal
        open={loading}
        footer={null}
        closable={false}
        centered
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <LoadingOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 20 }} />
          
          <Title level={4} style={{ marginBottom: 20 }}>
            {processingStage || 'Memproses Rekonsiliasi...'}
          </Title>
          
          <Progress
            percent={uploadProgress || 0}
            status={uploadProgress === 100 ? 'success' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          
          <div style={{ marginTop: 20 }}>
            <Text type="secondary">
              Mohon tunggu, sistem sedang memproses file rekonsiliasi Anda...
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FileUpload;
