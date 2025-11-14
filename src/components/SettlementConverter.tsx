import React, { useState, useEffect } from 'react';
import { Upload, Button, Card, Typography, Alert, Table, Space, message, Spin, List, Tag } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, HistoryOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { settlementAPI } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface SettlementRecord {
  [key: string]: string;
}

interface ConversionResult {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    total_records: number;
    preview_records: SettlementRecord[];
    download_url: string;
  };
  error?: string;
}

interface ConvertedFile {
  filename: string;
  size: number;
  modified_at: string;
  download_url: string;
}

const SettlementConverter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [settlementFile, setSettlementFile] = useState<UploadFile | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);

  const uploadProps: UploadProps = {
    maxCount: 1,
    beforeUpload: (file) => {
      const uploadFile: UploadFile = {
        uid: file.name,
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file as any,
      };
      setSettlementFile(uploadFile);
      setConversionResult(null); // Reset result saat upload file baru
      return false;
    },
    onRemove: () => {
      setSettlementFile(null);
      setConversionResult(null);
    },
    fileList: settlementFile ? [settlementFile] : [],
    // Accept all files (settlement files could be without extension or any extension)
  };

  // Fetch converted files on component mount
  useEffect(() => {
    fetchConvertedFiles();
  }, []);

  const fetchConvertedFiles = async () => {
    setLoadingHistory(true);
    try {
      const response = await settlementAPI.getConvertedFiles();
      if (response.success) {
        setConvertedFiles(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching converted files:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleConvert = async () => {
    if (!settlementFile?.originFileObj) {
      message.error('Pilih file settlement terlebih dahulu!');
      return;
    }

    setLoading(true);

    try {
      const response = await settlementAPI.convertSettlement(settlementFile.originFileObj as File);

      if (response.success) {
        message.success('File berhasil dikonversi ke CSV!');
        setConversionResult(response);
        // Refresh history
        fetchConvertedFiles();
      } else {
        message.error(response.message || 'Gagal mengkonversi file');
      }
    } catch (error: any) {
      console.error('Error:', error);
      message.error(error.response?.data?.message || 'Terjadi kesalahan saat konversi');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (conversionResult?.data?.filename) {
      const url = settlementAPI.downloadConverted(conversionResult.data.filename);
      const link = document.createElement('a');
      link.href = url;
      link.download = conversionResult.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('File berhasil di-download!');
    }
  };

  const handleReset = () => {
    setSettlementFile(null);
    setConversionResult(null);
  };

  // Define columns based on settlement CSV structure
  const tableColumns: ColumnsType<SettlementRecord> = [
    {
      title: 'No',
      dataIndex: 'No',
      key: 'No',
      width: 60,
      fixed: 'left',
    },
    {
      title: 'Trx Code',
      dataIndex: 'Trx_Code',
      key: 'Trx_Code',
      width: 100,
    },
    {
      title: 'Tanggal',
      dataIndex: 'Tanggal_Trx',
      key: 'Tanggal_Trx',
      width: 100,
    },
    {
      title: 'Jam',
      dataIndex: 'Jam_Trx',
      key: 'Jam_Trx',
      width: 90,
    },
    {
      title: 'RRN (Ref No)',
      dataIndex: 'Ref_No',
      key: 'Ref_No',
      width: 180,
      fixed: 'left',
    },
    {
      title: 'Trace No',
      dataIndex: 'Trace_No',
      key: 'Trace_No',
      width: 120,
    },
    {
      title: 'Terminal ID',
      dataIndex: 'Terminal_ID',
      key: 'Terminal_ID',
      width: 150,
    },
    {
      title: 'Merchant PAN',
      dataIndex: 'Merchant_PAN',
      key: 'Merchant_PAN',
      width: 150,
    },
    {
      title: 'Acquirer',
      dataIndex: 'Acquirer',
      key: 'Acquirer',
      width: 100,
    },
    {
      title: 'Issuer',
      dataIndex: 'Issuer',
      key: 'Issuer',
      width: 100,
    },
    {
      title: 'Customer PAN',
      dataIndex: 'Customer_PAN',
      key: 'Customer_PAN',
      width: 150,
    },
    {
      title: 'Nominal',
      dataIndex: 'Nominal',
      key: 'Nominal',
      width: 120,
      align: 'right',
    },
    {
      title: 'Merchant Category',
      dataIndex: 'Merchant_Category',
      key: 'Merchant_Category',
      width: 150,
    },
    {
      title: 'Merchant Criteria',
      dataIndex: 'Merchant_Criteria',
      key: 'Merchant_Criteria',
      width: 150,
    },
    {
      title: 'Response Code',
      dataIndex: 'Response_Code',
      key: 'Response_Code',
      width: 120,
    },
    {
      title: 'Merchant Name & Location',
      dataIndex: 'Merchant_Name_Location',
      key: 'Merchant_Name_Location',
      width: 250,
    },
    {
      title: 'Convenience Fee',
      dataIndex: 'Convenience_Fee',
      key: 'Convenience_Fee',
      width: 130,
      align: 'right',
    },
    {
      title: 'Interchange Fee',
      dataIndex: 'Interchange_Fee',
      key: 'Interchange_Fee',
      width: 130,
      align: 'right',
    },
  ];

  return (
    <div>
      <Title level={2}>Settlement File Converter</Title>
      <Paragraph>
        Konversi file Settlement format TXT (fixed-width) menjadi CSV. 
        File hasil konversi akan menghapus header dan menggabungkan semua tabel.
      </Paragraph>

      <Alert
        message="Format File yang Didukung"
        description="File Settlement dalam format apapun (dengan atau tanpa ekstensi). File akan otomatis dibaca sebagai format fixed-width seperti yang digunakan oleh ALTO/JALIN."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Upload Area */}
      <Card title="📁 Upload File Settlement" style={{ marginBottom: 16 }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Klik atau drag file Settlement ke area ini</p>
          <p className="ant-upload-hint">
            File Settlement akan otomatis dikonversi dari format fixed-width menjadi CSV
          </p>
        </Dragger>

        {settlementFile && (
          <Space style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={handleConvert}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Mengkonversi...' : 'Konversi ke CSV'}
            </Button>
            <Button onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </Space>
        )}
      </Card>

      {/* Loading Spinner */}
      {loading && (
        <Card style={{ marginBottom: 16, textAlign: 'center' }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: 16 }}>Sedang mengkonversi file...</Paragraph>
        </Card>
      )}

      {/* Conversion Result */}
      {conversionResult?.data && !loading && (
        <>
          <Card
            title="✅ Hasil Konversi"
            extra={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                Download CSV
              </Button>
            }
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Nama File: </Text>
              <Text>{conversionResult.data.filename}</Text>

              <Text strong>Total Records: </Text>
              <Text>{conversionResult.data.total_records.toLocaleString()}</Text>

              <Alert
                message="File CSV siap didownload!"
                description={`File berhasil dikonversi dengan ${conversionResult.data.total_records} records. Klik tombol Download CSV untuk mengunduh.`}
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Space>
          </Card>

          {/* Preview Table */}
          <Card title={`👁️ Preview Data (${Math.min(100, conversionResult.data.total_records)} dari ${conversionResult.data.total_records} baris)`} style={{ marginBottom: 16 }}>
            <Alert
              message="Preview Terbatas"
              description={`Menampilkan maksimal 100 baris pertama untuk menghindari browser crash. Total data: ${conversionResult.data.total_records.toLocaleString()} records. Download file CSV untuk melihat semua data.`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={tableColumns}
              dataSource={conversionResult.data.preview_records.map((record, index) => ({
                ...record,
                No: (index + 1).toString(), // Add row number
                key: index.toString(),
              }))}
              scroll={{ x: 2500, y: 400 }}
              pagination={{ pageSize: 20 }}
              size="small"
              bordered
              sticky
            />
          </Card>
        </>
      )}

      {/* History of Converted Files */}
      <Card 
        title={
          <Space>
            <HistoryOutlined />
            <span>Riwayat File Konversi</span>
          </Space>
        } 
        style={{ marginTop: 16 }}
        loading={loadingHistory}
      >
        {convertedFiles.length === 0 ? (
          <Alert
            message="Belum ada file yang dikonversi"
            description="File yang telah dikonversi akan muncul di sini"
            type="info"
            showIcon
          />
        ) : (
          <List
            dataSource={convertedFiles}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      const url = `http://localhost:8080${file.download_url}`;
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = file.filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      message.success('File berhasil di-download!');
                    }}
                  >
                    Download
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={file.filename}
                  description={
                    <Space split="|">
                      <span>Ukuran: {(file.size / 1024).toFixed(2)} KB</span>
                      <span>Dimodifikasi: {new Date(file.modified_at).toLocaleString('id-ID')}</span>
                    </Space>
                  }
                />
                <Tag color="green">CSV</Tag>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default SettlementConverter;
