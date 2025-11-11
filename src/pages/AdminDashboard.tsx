import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { 
  Column, 
  Line, 
  Pie, 
  Histogram, 
  Scatter 
} from '@ant-design/charts';

const { Title } = Typography;

// --- Data palsu (mock data) tidak berubah ---
const stackedColumnData = [
  { vendor: 'Alto', value: 220, type: 'Match' }, { vendor: 'Alto', value: 100, type: 'Mismatch' }, { vendor: 'Alto', value: 60, type: 'Pending' },
  { vendor: 'Jalin', value: 310, type: 'Match' }, { vendor: 'Jalin', value: 150, type: 'Mismatch' }, { vendor: 'Jalin', value: 80, type: 'Pending' },
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
// --- Konfigurasi (config) tidak berubah ---
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
    type: 'inner' as const, offset: '-50%', content: '{value}',
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
  data: scatterPlotData, xField: 'jumlahFile', yField: 'waktuProses',
  colorField: 'status', shape: 'circle' as const, size: 5,
  yAxis: { title: { text: 'Waktu Proses (detik)' } },
  xAxis: { title: { text: 'Jumlah File' } }, height: 250,
};

export default function Dashboard() {
  
  return (
    <div>
      <Title level={2}>Dashboard Operasional</Title>
      <Typography.Text type="secondary">
        Ringkasan hasil pemrosesan rekonsiliasi
      </Typography.Text>

      {/* Baris 1: Grafik Garis (Lebar Penuh) */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={24}>
          {/* --- 👇 Tambah border di sini 👇 --- */}
          <Card title="Tren Proses Harian (Grafik Garis)" style={{ minHeight: 320, border: '1px solid #e8e8e8' }}>
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>

      {/* Baris 2: Grid 2x2 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Kolom 1 */}
        <Col xs={24} md={12} lg={12}>
          {/* --- 👇 Tambah border di sini 👇 --- */}
          <Card title="Status Rekonsiliasi per Vendor" style={{ minHeight: 320, border: '1px solid #e8e8e8' }}>
            <Column {...columnConfig} />
          </Card>
        </Col>
        
        {/* Kolom 2 */}
        <Col xs={24} md={12} lg={12}>
          {/* --- 👇 Tambah border di sini 👇 --- */}
          <Card title="Proporsi Hasil (Diagram Lingkaran)" style={{ minHeight: 320, border: '1px solid #e8e8e8' }}>
            <Pie {...pieConfig} />
          </Card>
        </Col>
        
        {/* Kolom 3 */}
        <Col xs={24} md={12} lg={12}>
          {/* --- 👇 Tambah border di sini 👇 --- */}
          <Card title="Distribusi Waktu Proses (Histogram)" style={{ minHeight: 320, border: '1px solid #e8e8e8' }}>
            <Histogram {...histogramConfig} />
          </Card>
        </Col>
        
        {/* Kolom 4 */}
        <Col xs={24} md={12} lg={12}>
          {/* --- 👇 Tambah border di sini 👇 --- */}
          <Card title="Korelasi File vs Waktu (Scatter Plot)" style={{ minHeight: 320, border: '1px solid #e8e8e8' }}>
            <Scatter {...scatterConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}