import React, { useState } from 'react';
import { Upload, Button, Card, Row, Col, Typography, Divider, Alert } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface FileUploadProps {
  onUpload: (files: Record<string, File | File[]>) => void;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, loading }) => {
  // Multi-file support for CORE
  const [coreFiles, setCoreFiles] = useState<UploadFile[]>([]);
  
  // Multi-file support for vendor recon/settlement
  const [altoReconFiles, setAltoReconFiles] = useState<UploadFile[]>([]);
  const [altoSettlementFiles, setAltoSettlementFiles] = useState<UploadFile[]>([]);
  const [jalinReconFiles, setJalinReconFiles] = useState<UploadFile[]>([]);
  const [jalinSettlementFiles, setJalinSettlementFiles] = useState<UploadFile[]>([]);
  const [ajReconFiles, setAjReconFiles] = useState<UploadFile[]>([]);
  const [ajSettlementFiles, setAjSettlementFiles] = useState<UploadFile[]>([]);
  const [rintiReconFiles, setRintiReconFiles] = useState<UploadFile[]>([]);
  const [rintiSettlementFiles, setRintiSettlementFiles] = useState<UploadFile[]>([]);

  // Create upload props for multi-file upload
  const createMultiUploadProps = (
    setter: React.Dispatch<React.SetStateAction<UploadFile[]>>,
    currentFiles: UploadFile[]
  ): UploadProps => ({
    multiple: true,
    beforeUpload: (file) => {
      const uploadFile: UploadFile = {
        uid: file.name + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file as any,
      };
      setter([...currentFiles, uploadFile]);
      return false;
    },
    onRemove: (file) => {
      setter(currentFiles.filter(f => f.uid !== file.uid));
    },
    fileList: currentFiles,
  });

  const handleSubmit = () => {
    const files: Record<string, File | File[]> = {};
    
    console.log('Core files state:', coreFiles);
    
    // Convert coreFiles array to File[] for upload
    if (coreFiles.length > 0) {
      files.coreFiles = coreFiles.map(f => f.originFileObj as File).filter(Boolean);
      console.log('Core files added:', files.coreFiles);
    } else {
      console.error('No core files selected!');
    }
    
    // Convert vendor files
    if (altoReconFiles.length > 0) {
      files.altoReconFiles = altoReconFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (altoSettlementFiles.length > 0) {
      files.altoSettlementFiles = altoSettlementFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (jalinReconFiles.length > 0) {
      files.jalinReconFiles = jalinReconFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (jalinSettlementFiles.length > 0) {
      files.jalinSettlementFiles = jalinSettlementFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (ajReconFiles.length > 0) {
      files.ajReconFiles = ajReconFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (ajSettlementFiles.length > 0) {
      files.ajSettlementFiles = ajSettlementFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (rintiReconFiles.length > 0) {
      files.rintiReconFiles = rintiReconFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (rintiSettlementFiles.length > 0) {
      files.rintiSettlementFiles = rintiSettlementFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    
    console.log('All files to upload:', files);
    console.log('Total file groups:', Object.keys(files).length);
    
    onUpload(files);
  };

  const hasVendorFiles = altoReconFiles.length > 0 || altoSettlementFiles.length > 0 || 
                         jalinReconFiles.length > 0 || jalinSettlementFiles.length > 0 || 
                         ajReconFiles.length > 0 || ajSettlementFiles.length > 0 || 
                         rintiReconFiles.length > 0 || rintiSettlementFiles.length > 0;
  const canSubmit = coreFiles.length > 0 && hasVendorFiles && !loading;

  return (
    <div>
      <Title level={2}>Upload File Rekonsiliasi</Title>
      <Alert
        message="Petunjuk"
        description="Upload file Core (wajib, bisa multiple) dan minimal satu file vendor (Recon atau Settlement). Sistem akan auto-detect vendor dari nama file CORE (harus mengandung: ALTO, JALIN, AJ, atau RINTI). Format: CSV, TXT"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Core Files - Multiple */}
      <Card title="📄 Core Files (Wajib - Multiple)" style={{ marginBottom: 16 }}>
        <Alert
          message="Pastikan nama file mengandung vendor (contoh: ALTO, JALIN)"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Dragger {...createMultiUploadProps(setCoreFiles, coreFiles)} accept=".csv">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Klik atau drag file Core ke area ini (bisa multiple)</p>
          <p className="ant-upload-hint">File CSV yang berisi data transaksi core. Bisa upload beberapa file sekaligus.</p>
          {coreFiles.length > 0 && (
            <p className="ant-upload-hint" style={{ color: '#52c41a', fontWeight: 'bold' }}>
              {coreFiles.length} file ter-upload
            </p>
          )}
        </Dragger>
      </Card>

      <Divider>Vendor Files (Multiple per vendor)</Divider>

      {/* Alto */}
      <Card title="🏢 Alto" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Reconciliation Files (Multiple)</Text>
            <Upload {...createMultiUploadProps(setAltoReconFiles, altoReconFiles)} accept=".csv,.txt">
              <Button icon={<UploadOutlined />} block>
                Upload Alto Recon {altoReconFiles.length > 0 && `(${altoReconFiles.length})`}
              </Button>
            </Upload>
          </Col>
          <Col span={12}>
            <Text strong>Settlement Files (Multiple)</Text>
            <Upload {...createMultiUploadProps(setAltoSettlementFiles, altoSettlementFiles)} accept=".csv,.txt,.bin">
              <Button icon={<UploadOutlined />} block>
                Upload Alto Settlement {altoSettlementFiles.length > 0 && `(${altoSettlementFiles.length})`}
              </Button>
            </Upload>
          </Col>
        </Row>
      </Card>

      {/* Jalin */}
      <Card title="🏢 Jalin" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Reconciliation Files (Multiple)</Text>
            <Upload {...createMultiUploadProps(setJalinReconFiles, jalinReconFiles)} accept=".csv,.txt">
              <Button icon={<UploadOutlined />} block>
                Upload Jalin Recon {jalinReconFiles.length > 0 && `(${jalinReconFiles.length})`}
              </Button>
            </Upload>
          </Col>
          <Col span={12}>
            <Text strong>Settlement Files (Multiple)</Text>
            <Upload {...createMultiUploadProps(setJalinSettlementFiles, jalinSettlementFiles)} accept=".csv,.txt,.bin">
              <Button icon={<UploadOutlined />} block>
                Upload Jalin Settlement {jalinSettlementFiles.length > 0 && `(${jalinSettlementFiles.length})`}
              </Button>
            </Upload>
          </Col>
        </Row>
      </Card>

      {/* AJ */}
      <Card title="🏢 AJ" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Reconciliation Files (Multiple)</Text>
            <Upload {...createMultiUploadProps(setAjReconFiles, ajReconFiles)} accept=".csv,.txt">
              <Button icon={<UploadOutlined />} block>
                Upload AJ Recon {ajReconFiles.length > 0 && `(${ajReconFiles.length})`}
              </Button>
            </Upload>
          </Col>
          <Col span={12}>
            <Text strong>Settlement Files (Multiple)</Text>
            <Upload {...createMultiUploadProps(setAjSettlementFiles, ajSettlementFiles)} accept=".csv,.txt,.bin">
              <Button icon={<UploadOutlined />} block>
                Upload AJ Settlement {ajSettlementFiles.length > 0 && `(${ajSettlementFiles.length})`}
              </Button>
            </Upload>
          </Col>
        </Row>
      </Card>

      {/* Rinti */}
      <Card title="🏢 Rinti" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Reconciliation Files (Multiple)</Text>
            <Upload {...createMultiUploadProps(setRintiReconFiles, rintiReconFiles)} accept=".csv,.txt">
              <Button icon={<UploadOutlined />} block>
                Upload Rinti Recon {rintiReconFiles.length > 0 && `(${rintiReconFiles.length})`}
              </Button>
            </Upload>
          </Col>
          <Col span={12}>
            <Text strong>Settlement Files (Multiple)</Text>
            <Upload {...createMultiUploadProps(setRintiSettlementFiles, rintiSettlementFiles)} accept=".csv,.txt,.bin">
              <Button icon={<UploadOutlined />} block>
                Upload Rinti Settlement {rintiSettlementFiles.length > 0 && `(${rintiSettlementFiles.length})`}
              </Button>
            </Upload>
          </Col>
        </Row>
      </Card>

      <Divider />

      <Button
        type="primary"
        size="large"
        block
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={loading}
      >
        {loading ? 'Memproses Rekonsiliasi...' : 'Proses Rekonsiliasi'}
      </Button>
    </div>
  );
};

export default FileUpload;
