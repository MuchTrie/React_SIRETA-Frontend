import { Row, Col, Card, Typography, Statistic, Table, Divider, Tag } from 'antd';
import { 
  ProjectOutlined, 
  DatabaseOutlined, 
  ClockCircleOutlined, 
  ShopOutlined 
} from '@ant-design/icons';
import { 
  Column, 
  Line, 
  Pie, 
  Histogram, 
  Scatter 
} from '@ant-design/charts';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

// --- Data Palsu (Semua data dan config Anda tetap sama) ---
const summaryStats = {
  totalJobs: 8,
  totalResultFiles: 9,
  latestJob: '11/11/2025',
  uniqueVendors: 2
};
const vendorDistribution = [
  { vendor: 'JALIN', files: 1 },
  { vendor: 'ALTO', files: 8 }
];
const jobHistory = [
  { id: '#0001', tanggal: '11/11/2025', vendor: 'JALIN', totalFiles: 1 },
  { id: '#0002', tanggal: '11/11/2025', vendor: 'ALTO', totalFiles: 2 },
  { id: '#0003', tanggal: '10/11/2025', vendor: 'ALTO', totalFiles: 3 },
  { id: '#0004', tanggal: '10/11/2025', vendor: 'JALIN', totalFiles: 1 },
  { id: '#0005', tanggal: '09/11/2025', vendor: 'ALTO', totalFiles: 3 },
];
const stackedColumnData = [
  { vendor: 'Alto', value: 220, type: 'Match' }, { vendor: 'Alto', value: 100, type: 'Mismatch' }, { vendor: 'Alto', value: 60, type: 'Pending' },
  { vendor: 'JJALIN', value: 310, type: 'Match' }, { vendor: 'JJALIN', value: 150, type: 'Mismatch' }, { vendor: 'JJALIN', value: 80, type: 'Pending' },
];
const lineChartData = [
  { date: '2025-11-01', value: 300, type: 'Sukses' }, { date: '2025-11-01', value: 50, type: 'Gagal' },
  { date: '2025-11-02', value: 400, type: 'Sukses' }, { date: '2025-11-02', value: 70, type: 'Gagal' },
  { date: '2025-11-03', value: 350, type: 'Sukses' }, { date: '2025-11-03', value: 60, type: 'Gagal' },
  { date: '2025-11-04', value: 500, type: 'Sukses' }, { date: '2025-11-04', value: 80, type: 'Gagal' },
  { date: '2025-11-05', value: 450, type: 'Sukses' }, { date: '2025-11-05', value: 110, type: 'Gagal' },
];
const pieChartData = [
  { type: 'Match', value: 2700 },
  { type: 'Mismatch', value: 250 },
  { type: 'Belum Diproses', value: 180 },
];
const histogramData = [
  { value: 1.5 }, { value: 2.1 }, { value: 2.5 }, { value: 2.8 }, { value: 3.1 },
  { value: 3.2 }, { value: 3.2 }, { value: 3.3 }, { value: 3.5 }, { value: 3.5 },
  { value: 3.6 }, { value: 3.8 }, { value: 4.0 }, { value: 4.1 }, { value: 4.1 },
  { value: 4.2 }, { value: 4.2 }, { value: 4.2 }, { value: 4.3 }, { value: 4.5 },
  { value: 4.8 }, { value: 5.1 }, { value: 5.3 }, { value: 5.5 }, { value: 5.8 },
  { value: 6.2 }, { value: 6.5 }, { value: 7.1 }, { value: 8.5 }, { value: 9.2 }
];
const scatterPlotData = [
  { jumlahFile: 10, waktuProses: 5, status: 'Sukses' }, { jumlahFile: 20, waktuProses: 7, status: 'Sukses' },
  { jumlahFile: 5, waktuProses: 10, status: 'Gagal' }, { jumlahFile: 30, waktuProses: 12, status: 'Sukses' },
  { jumlahFile: 50, waktuProses: 15, status: 'Sukses' }, { jumlahFile: 15, waktuProses: 6, status: 'Sukses' },
  { jumlahFile: 25, waktuProses: 11, status: 'Gagal' }, { jumlahFile: 45, waktuProses: 14, status: 'Sukses' },
];

// --- Konfigurasi (config) ---
const columnConfig = {
  data: stackedColumnData, isStack: true, xField: 'vendor',
  yField: 'value', seriesField: 'type',
  legend: { position: 'top' as const },
  color: ['#34A853', '#4285F4', '#FF69B4'], height: 250,
};
const lineConfig = {
  data: lineChartData, xField: 'date', yField: 'value',
  seriesField: 'type', yAxis: { label: { formatter: (v: string) => `${v}` } },
  legend: { position: 'top' as const }, point: { size: 5, shape: 'diamond' },
  height: 250,
};
const pieConfig = {
  appendPadding: 10, data: pieChartData, angleField: 'value',
  colorField: 'type', radius: 0.8,
  label: {
    type: 'inner' as const, 
    offset: '-50%', 
    content: (data: any) => `${(data.percentage * 100).toFixed(0)}%`, // Perbaikan
    style: { textAlign: 'center' as const, fontSize: 12, fill: '#fff' },
  },
  interactions: [{ type: 'element-selected' as const }, { type: 'element-active' as const }],
  legend: { position: 'bottom' as const }, height: 250,
};
const histogramConfig = {
  data: histogramData,
  binField: 'value',
  binWidth: 1,
  height: 250,
};
const scatterConfig = {
  data: scatterPlotData, 
  xField: 'jumlahFile', 
  yField: 'waktuProses',
  colorField: 'status', 
  shape: 'circle' as const, 
  size: 5,
  yAxis: { title: { text: 'Waktu Proses (detik)' } },
  xAxis: { title: { text: 'Jumlah File' } }, 
  height: 250,
};

export default function Dashboard() { 
  const { theme: themeMode } = useTheme();
  
  return (
    <div>
      <Title level={2}>Dashboard Operasional</Title>
      <Text type="secondary">
        Ringkasan hasil pemrosesan rekonsiliasi
      </Text>

      {/* --- 👇 BAGIAN STATS, DISTRIBUSI, & RIWAYAT (DIPINDAH KE ATAS) 👇 --- */}
      
      {/* Ringkasan Statistik */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Total Jobs"
              value={summaryStats.totalJobs}
              prefix={<ProjectOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Total Result Files"
              value={summaryStats.totalResultFiles}
              prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Latest Job"
              value={summaryStats.latestJob}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Unique Vendors"
              value={summaryStats.uniqueVendors}
              prefix={<ShopOutlined style={{ color: '#f5222d' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Distribusi Vendor */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Distribusi Vendor">
            <Row gutter={[16, 16]} justify="start"> {/* Ganti 'center' menjadi 'start' */}
              {vendorDistribution.map((item, index) => (
                // Ganti Col span agar tidak terlalu kecil
                <Col xs={12} sm={8} md={6} key={index}> 
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Text strong style={{ fontSize: '18px', display: 'block' }}>{item.vendor}</Text>
                    <Text type="secondary" style={{ fontSize: '14px' }}>{item.files} file{item.files > 1 ? 's' : ''}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Riwayat Job Rekonsiliasi */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Riwayat Job Rekonsiliasi">
            <Table
              dataSource={jobHistory}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'ID',
                  dataIndex: 'id',
                  key: 'id',
                  render: (id: string) => <Tag color="blue">{id}</Tag>, // Tambah render Tag
                },
                {
                  title: 'Tanggal',
                  dataIndex: 'tanggal',
                  key: 'tanggal',
                },
                {
                  title: 'Vendor',
                  dataIndex: 'vendor',
                  key: 'vendor',
                  render: (vendor: string) => (
                    <Tag color="green">{vendor}</Tag>
                  ),
                },
                {
                  title: 'Total Files',
                  dataIndex: 'totalFiles',
                  key: 'totalFiles',
                  render: (files: number) => (
                    <Tag color="orange">{`${files} file${files > 1 ? 's' : ''}`}</Tag> // Ganti Badge
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* --- 👆 AKHIR BAGIAN STATS, DISTRIBUSI, & RIWAYAT 👆 --- */}

      <Divider style={{ marginTop: 32, marginBottom: 24 }}>Visualisasi Data</Divider>

      {/* --- 👇 BAGIAN CHARTS (SEKARANG DI BAWAH) 👇 --- */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={24}>
          <Card title="Tren Proses Harian" style={{ minHeight: 320 }}>
            <Line {...lineConfig} theme={themeMode} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12} lg={12}>
          <Card title="Status Rekonsiliasi per Vendor" style={{ minHeight: 320 }}>
            <Column {...columnConfig} theme={themeMode} />
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={12}>
          <Card title="Proporsi Hasil" style={{ minHeight: 320 }}>
            <Pie {...pieConfig} theme={themeMode} />
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={12}>
          <Card title="Distribusi Waktu Proses" style={{ minHeight: 320 }}>
            <Histogram {...histogramConfig} theme={themeMode} />
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={12}>
          <Card title="Korelasi File vs Waktu" style={{ minHeight: 320 }}>
            <Scatter {...scatterConfig} theme={themeMode} />
          </Card>
        </Col>
      </Row>

    </div>
  );
}