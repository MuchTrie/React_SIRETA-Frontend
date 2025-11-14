import React, { useState } from 'react';
import { Upload, Button, Card, Row, Col, Typography, Divider, Alert, Tag, Space, Progress, Modal } from 'antd';
import { 
  InboxOutlined, 
  FileTextOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  CloudUploadOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
import type { UploadFile } from 'antd';

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
  
  // Deteksi berdasarkan nama vendor (untuk file core atau file dengan nama vendor)
  if (name.includes('jalin')) return 'jalin';
  if (name.includes('alto')) return 'alto';
  if (name.includes('aj')) return 'aj';
  if (name.includes('rinti')) return 'rinti';
  
  return null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, loading, uploadProgress, processingStage }) => {
  const [coreFiles, setCoreFiles] = useState<UploadFile[]>([]);
  const [reconFiles, setReconFiles] = useState<UploadFile[]>([]);
  const [settlementFiles, setSettlementFiles] = useState<UploadFile[]>([]);

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

  return (
    <div>
      <Title level={2}>
        <CloudUploadOutlined /> Upload File Rekonsiliasi
      </Title>
      
      <Alert
        message="Cara Penggunaan"
        description={
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              1. Upload <strong>CORE file(s)</strong> (wajib)<br />
              2. Upload <strong>Reconciliation files</strong> - nama file harus mengandung vendor (ALTO/JALIN/AJ/RINTI)<br />
              3. Upload <strong>Settlement files</strong> - nama file harus mengandung vendor (ALTO/JALIN/AJ/RINTI)<br />
              4. Klik <strong>Proses Rekonsiliasi</strong>
            </Paragraph>
            <Text type="warning">💡 Tip: Pastikan nama file mengandung keyword vendor untuk auto-detect</Text>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

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
        style={{ marginBottom: 16 }}
      >
        <Dragger
          multiple
          accept=".csv"
          beforeUpload={(file) => {
            const uploadFile: UploadFile = {
              uid: file.name + Date.now(),
              name: file.name,
              size: file.size,
              type: file.type,
              originFileObj: file as any,
            };
            setCoreFiles([...coreFiles, uploadFile]);
            return false;
          }}
          onRemove={(file) => {
            setCoreFiles(coreFiles.filter(f => f.uid !== file.uid));
          }}
          fileList={coreFiles}
          showUploadList={true}
          listType="text"
          customRequest={({ onSuccess }) => {
            setTimeout(() => {
              onSuccess && onSuccess("ok");
            }, 0);
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Drag & Drop CORE files di sini atau klik untuk upload</p>
          <p className="ant-upload-hint">
            Support: CSV files | Multiple files OK
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
            style={{ marginBottom: 16, height: '100%' }}
          >
            <Dragger
              multiple
              beforeUpload={(file) => {
                const uploadFile: UploadFile = {
                  uid: file.name + Date.now(),
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  originFileObj: file as any,
                };
                setReconFiles([...reconFiles, uploadFile]);
                return false;
              }}
              onRemove={(file) => {
                setReconFiles(reconFiles.filter(f => f.uid !== file.uid));
              }}
              fileList={reconFiles}
              style={{ minHeight: 220 }}
              showUploadList={true}
              listType="text"
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  onSuccess && onSuccess("ok");
                }, 0);
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#52c41a' }} />
              </p>
              <p className="ant-upload-text">Drag & Drop Reconciliation files</p>
              <p className="ant-upload-hint">
                CSV/TXT/File tanpa ekstensi | Auto-detect vendor dari nama file
              </p>
            </Dragger>

            {reconFiles.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
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
            style={{ marginBottom: 16, height: '100%' }}
          >
            <Dragger
              multiple
              beforeUpload={(file) => {
                const uploadFile: UploadFile = {
                  uid: file.name + Date.now(),
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  originFileObj: file as any,
                };
                setSettlementFiles([...settlementFiles, uploadFile]);
                return false;
              }}
              onRemove={(file) => {
                setSettlementFiles(settlementFiles.filter(f => f.uid !== file.uid));
              }}
              fileList={settlementFiles}
              style={{ minHeight: 220 }}
              showUploadList={true}
              listType="text"
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  onSuccess && onSuccess("ok");
                }, 0);
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#fa8c16' }} />
              </p>
              <p className="ant-upload-text">Drag & Drop Settlement files</p>
              <p className="ant-upload-hint">
                CSV/TXT/BIN/File tanpa ekstensi | Auto-detect vendor dari nama file
              </p>
            </Dragger>

            {settlementFiles.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
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
          title="📊 Summary Upload"
          style={{ marginBottom: 16, background: '#fafafa' }}
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
