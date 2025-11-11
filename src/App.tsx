import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
// 1. Impor ConfigProvider dan theme
import { ConfigProvider, theme } from 'antd'; 
// 2. Impor hook tema baru kita
import { useTheme } from './context/ThemeContext'; 

// Halaman-halaman
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import OperationalDashboard from './pages/OperationalDashboard';
import ProsesRekonsiliasiPage from './pages/ProsesRekonsiliasiPage';
import ResultHistoryPage from './pages/ResultHistoryPage';
import SettlementConverterPage from './pages/SettlementConverterPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

// Komponen Layout & Proteksi
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// --- 👇 TEMA KUSTOM ANDA 👇 ---

// 3. Definisi token warna kustom untuk mode gelap
const customDarkTheme = {
  algorithm: theme.darkAlgorithm, // Mulai dari algoritma gelap dasar
  token: {
    // Background utama di area konten (paling gelap)
    colorBgLayout: '#0f0f17', 
    
    // Background untuk komponen (Header, Sider, Card, Menu)
    colorBgContainer: '#1a1a2e', // Sedikit lebih cerah
    colorBgElevated: '#25254f',
    
    // Warna border
    colorBorder: '#3d3d5c',
    colorBorderSecondary: '#2d2d4a',

    // Warna teks
    colorText: 'rgba(255, 255, 255, 0.95)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',

    // Warna primary (aksen biru)
    colorPrimary: '#1890ff',
    colorPrimaryBg: '#111a2e',
    colorPrimaryBorder: '#15395b',

    // Warna link
    colorLink: '#177ddc',
    colorLinkHover: '#3c9ae8',

    // Error, Warning, Success
    colorErrorBg: '#2f1515',
    colorSuccessBg: '#162312',
    colorWarningBg: '#2b2111',
    colorInfoBg: '#111a2e',

    // Header theme untuk dark mode
    colorBgHeader: '#1a1a2e',
  },
  components: {
    Layout: {
      headerBg: '#1a1a2e',
      headerHeight: 64,
      headerPadding: '0 24px',
      headerColor: 'rgba(255, 255, 255, 0.95)',
      siderBg: '#1a1a2e',
    },
  }
};

// 4. Definisi tema terang (standar Ant Design dengan kustomisasi)
const customLightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorBgLayout: '#fafafa',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#fafafa',
    
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',

    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',

    colorPrimary: '#1890ff',
    colorPrimaryBg: '#e6f7ff',
    colorPrimaryBorder: '#91caff',

    colorLink: '#1890ff',
    colorLinkHover: '#40a9ff',

    colorErrorBg: '#fff7e6',
    colorSuccessBg: '#f6ffed',
    colorWarningBg: '#fffbe6',
    colorInfoBg: '#e6f7ff',

    // Header theme untuk light mode
    colorBgHeader: '#ffffff',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      headerColor: 'rgba(0, 0, 0, 0.88)',
      siderBg: '#ffffff',
    },
  }
};
// --- 👆 AKHIR TEMA KUSTOM 👆 ---


export default function App() {
  // Dapatkan mode tema saat ini
  const { theme: themeMode } = useTheme();

  // 5. Pilih objek tema yang benar berdasarkan mode
  const antdTheme = themeMode === 'dark' ? customDarkTheme : customLightTheme;

  return (
    // 6. Terapkan tema ke ConfigProvider
    <ConfigProvider theme={antdTheme}>
      <Routes>
        {/* Rute Publik (Tanpa Login) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rute Privat (Harus Login) */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operasional']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* ... (Semua rute Anda yang lain) ... */}
          <Route path="admin" element={ <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute> } />
          <Route path="admin/settings" element={ <ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute> } />
          <Route path="operasional" element={ <ProtectedRoute allowedRoles={['operasional']}><OperationalDashboard /></ProtectedRoute> } />
          <Route path="proses-rekonsiliasi" element={ <ProtectedRoute allowedRoles={['operasional']}><ProsesRekonsiliasiPage /></ProtectedRoute> } />
          <Route path="settlement-converter" element={ <ProtectedRoute allowedRoles={['operasional']}><SettlementConverterPage /></ProtectedRoute> } />
          <Route path="riwayat-recon" element={ <ProtectedRoute allowedRoles={['admin', 'operasional']}><ResultHistoryPage /></ProtectedRoute> } />
          <Route index element={<NavigateToDashboard />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

// Komponen helper (tetap sama)
function NavigateToDashboard() {
  const { user } = useAuth(); 

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'operasional') {
    return <Navigate to="/operasional" replace />;
  }
  return <Navigate to="/login" replace />; 
}
