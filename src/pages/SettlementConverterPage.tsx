import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Upload, 
  Button, 
  message, 
  Spin, 
  Table, 
  Space, 
  Popconfirm, 
  Divider 
} from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { getConvertedFiles, deleteConvertedFile, ConvertedFile } from '../services/converterApi';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function SettlementConverterPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [historyFiles, setHistoryFiles] = useState<ConvertedFile[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const files = await getConvertedFiles();
      setHistoryFiles(files);
    } catch (error) {
      message.error('Gagal memuat riwayat file');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (filename: string) => {
    try {
      await deleteConvertedFile(filename);
      message.success(`File ${filename} berhasil dihapus.`);
      setHistoryFiles((prevFiles) =>
        prevFiles.filter((file) => file.filename !== filename)
      );
    } catch (error) {
      message.error(`Gagal menghapus file ${filename}`);
    }
  };

  const columns = [
    {
      title: 'Nama File',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: 'Ukuran',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`,
    },
    {
      title: 'Tanggal Modifikasi',
      dataIndex: 'last_modified',
      key: 'last_modified',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: ConvertedFile) => (
        <Space size="middle">
          <Button icon={<DownloadOutlined />} size="small">
            Download
          </Button>
          <Popconfirm
            title="Yakin ingin menghapus file ini?"
            description="File yang dihapus tidak dapat dikembalikan."
            onConfirm={() => handleDelete(record.filename)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- 👇 KODE BARU UNTUK UPLOAD FILE CONVERTER 👇 ---
  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    // Hanya ambil file terakhir yang di-upload jika Anda hanya mengizinkan satu file
    // Jika Anda ingin multiple file, setFileList(newFileList);
    setFileList(newFileList.slice(-1)); 
  };

  const onRemove = (file: UploadFile) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    return false;
  };

  const beforeUpload = (file: UploadFile) => {
    // Mencegah upload otomatis, agar kita bisa memicu konversi secara manual
    // Hanya simpan file ke state
    setFileList([...fileList, file]);
    return false; 
  };

  const handleStartConversion = async () => {
    if (fileList.length === 0) {
      message.error('Silakan pilih file untuk dikonversi terlebih dahulu!');
      return;
    }

    setLoading(true);
    try {
      // Di sini Anda akan memanggil API konversi Anda
      // Contoh: await converterApi.convertFile(fileList[0].originFileObj as File);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi API call
      message.success('File berhasil dikonversi!');
      setFileList([]); // Bersihkan daftar file setelah berhasil
      fetchHistory(); // Muat ulang riwayat
    } catch (error) {
      message.error('Gagal melakukan konversi file!');
    } finally {
      setLoading(false);
    }
  };
  // --- 👆 AKHIR KODE BARU UNTUK UPLOAD FILE CONVERTER 👆 ---

  return (
    <div>
      <Title level={2}>Settlement Converter</Title>
      <Text type="secondary">
        Upload file settlement untuk dikonversi ke format standar.
      </Text>

      <Card style={{ marginTop: 24 }}>
        <Dragger
          // --- 👇 TAMBAHAN KODE DI SINI 👇 ---
          // Tambahkan style untuk menimpa warna teks link Ant Design
          style={{
            // Targetkan teks utama daftar file saat tidak di-hover
            // Ini akan membuat teks file selalu hitam
            '--antd-color-text': 'black', 
            // Targetkan ikon hapus saat tidak di-hover (merah)
            '--antd-color-error': '#ff4d4f', 
            // Targetkan ikon hapus saat di-hover (merah gelap)
            '--antd-color-error-hover': '#cf1322',
          } as React.CSSProperties} // Cast ke CSSProperties untuk TypeScript
          // --- 👆 AKHIR TAMBAHAN 👆 ---

          multiple={false} // Hanya izinkan satu file untuk konversi
          onRemove={onRemove}
          beforeUpload={beforeUpload}
          fileList={fileList} // Tampilkan daftar file yang dipilih
          accept=".csv,.txt,.bin"
        >
          <p className="ant-upload-drag-icon"><UploadOutlined /></p>
          <p className="ant-upload-text">Klik atau seret file ke area ini</p>
          <p className="ant-upload-hint">Support: CSV, TXT, BIN files | Hanya satu file per konversi</p>
        </Dragger>
        <Button
          type="primary"
          onClick={handleStartConversion}
          loading={loading}
          disabled={fileList.length === 0} // Nonaktifkan jika tidak ada file
          style={{ marginTop: 16 }}
        >
          {loading ? 'Mengkonversi...' : 'Mulai Konversi'}
        </Button>
      </Card>
      
      <Divider />

      <Title level={3}>Riwayat File Konversi</Title>
      <Table
        columns={columns}
        dataSource={historyFiles}
        loading={historyLoading}
        rowKey="filename"
      />
    </div>
  );
}