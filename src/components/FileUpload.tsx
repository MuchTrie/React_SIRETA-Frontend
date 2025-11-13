import React, { useState } from 'react';
import { Upload, Button, Card, Row, Col, Typography, Alert } from 'antd';
import { 
  UploadOutlined, 
  DatabaseOutlined, 
  FileTextOutlined, 
  FileDoneOutlined 
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface FileUploadProps {
  onUpload: (files: Record<string, File | File[]>) => void;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, loading }) => {
  const [coreFiles, setCoreFiles] = useState<UploadFile[]>([]);
  const [reconFiles, setReconFiles] = useState<UploadFile[]>([]);
  const [settlementFiles, setSettlementFiles] = useState<UploadFile[]>([]);

  // --- 👇 PERBAIKAN DI SINI 👇 ---
  // 1. Fungsi ini sekarang menerima 'currentFiles'
  const createMultiUploadProps = (
    currentFiles: UploadFile[], 
    setter: React.Dispatch<React.SetStateAction<UploadFile[]>>
  ): UploadProps => ({
    multiple: true,
    accept: ".csv,.txt,.bin",
    beforeUpload: (file) => {
      const uploadFile: UploadFile = {
        uid: file.name + Date.now(),
        name: file.name,
        originFileObj: file as any,
      };
      setter((prevFiles) => [...prevFiles, uploadFile]);
      return false; 
    },
    onRemove: (file) => {
      setter((prevFiles) => prevFiles.filter(f => f.uid !== file.uid));
    },
    // 2. Gunakan 'currentFiles' alih-alih '[]'
    // Ini akan menampilkan daftar file yang telah Anda tambahkan
    fileList: currentFiles, 
  });
  // --- 👆 AKHIR PERBAIKAN 👆 ---

  const handleSubmit = () => {
    const files: Record<string, File | File[]> = {};
    
    if (coreFiles.length > 0) {
      files.coreFiles = coreFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (reconFiles.length > 0) {
      files.reconFiles = reconFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    if (settlementFiles.length > 0) {
      files.settlementFiles = settlementFiles.map(f => f.originFileObj as File).filter(Boolean);
    }
    
    onUpload(files);
  };

  const canSubmit = coreFiles.length > 0 && (reconFiles.length > 0 || settlementFiles.length > 0) && !loading;

  return (
    <div>
      <Title level={2} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <UploadOutlined style={{ marginRight: 12, fontSize: '28px' }} /> Upload File Rekonsiliasi
      </Title>

      <Alert
        message={<Text strong>Cara Penggunaan</Text>}
        description={
          <div>
            <Paragraph style={{ margin: 0 }}>1. Upload CORE File(s) (wajib)</Paragraph>
            <Paragraph style={{ margin: 0 }}>2. Upload Reconciliation Files - nama file harus mengandung vendor (ALTO/JALIN/AJ/RINTI)</Paragraph>
            <Paragraph style={{ margin: 0 }}>3. Upload Settlement Files - nama file harus mengandung vendor (ALTO/JALIN/AJ/RINTI)</Paragraph>
            <Paragraph style={{ margin: 0 }}>4. Klik Proses Rekonsiliasi</Paragraph>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              💡 Tip: Pastikan nama file mengandung keyword vendor untuk auto-detect
            </Text>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card 
        title={<span><DatabaseOutlined style={{ marginRight: 8 }} /> CORE Files (Wajib)</span>} 
        bordered={false}
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
      >
        {/* 3. Kirim 'coreFiles' dan 'setCoreFiles' */}
        <Dragger {...createMultiUploadProps(coreFiles, setCoreFiles)}>
          <p className="ant-upload-drag-icon">
            <DatabaseOutlined style={{ color: '#1890ff', fontSize: 48 }} />
          </p>
          <p className="ant-upload-text">Drag & Drop CORE files di sini atau klik untuk upload</p>
          <p className="ant-upload-hint">Support: CSV files | Multiple Files OK</p>
          {/* Teks {coreFiles.length} file dipilih akan otomatis tergantikan oleh fileList */}
        </Dragger>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card 
            title={<span><FileTextOutlined style={{ marginRight: 8 }} /> Reconciliation Files</span>} 
            bordered={false}
            bodyStyle={{ padding: 16 }}
          >
            {/* 3. Kirim 'reconFiles' dan 'setReconFiles' */}
            <Dragger {...createMultiUploadProps(reconFiles, setReconFiles)}>
              <p className="ant-upload-drag-icon">
                <FileTextOutlined style={{ color: '#52c41a', fontSize: 48 }} />
              </p>
              <p className="ant-upload-text">Drag & Drop Reconciliation files</p>
              <p className="ant-upload-hint">CSV/TXT | Auto-detect vendor dari nama file</p>
            </Dragger>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={<span><FileDoneOutlined style={{ marginRight: 8 }} /> Settlement Files</span>} 
            bordered={false}
            bodyStyle={{ padding: 16 }}
          >
            {/* 3. Kirim 'settlementFiles' dan 'setSettlementFiles' */}
            <Dragger {...createMultiUploadProps(settlementFiles, setSettlementFiles)}>
              <p className="ant-upload-drag-icon">
                <FileDoneOutlined style={{ color: '#faad14', fontSize: 48 }} />
              </p>
              <p className="ant-upload-text">Drag & Drop Settlement files</p>
              <p className="ant-upload-hint">CSV/TXT/BIN | Auto-detect vendor dari nama file</p>
            </Dragger>
          </Card>
        </Col>
      </Row>

      <Button
        type="primary"
        size="large"
        block
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={loading}
        style={{ marginTop: 24 }}
      >
        {loading ? 'Memproses Rekonsiliasi...' : 'Proses Rekonsiliasi'}
      </Button>
    </div>
  );
};

export default FileUpload;