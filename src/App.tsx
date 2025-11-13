import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ConfigProvider, theme } from 'antd'; 
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
import UserSettingsPage from './pages/UserSettingsPage';


// Komponen Layout & Proteksi
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// --- TEMA KUSTOM ANDA (SESUAI SCREENSHOT) ---
const customDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Background utama di area konten (PALING GELAP)
    colorBgLayout: '#1c1c27', 
    
    // Background untuk KOMPONEN (Header, Sider, Card, Menu)
    colorBgContainer: '#28283e', // LEBIH TERANG
    
    // Warna border pemisah
    colorBorderSecondary: '#3a3a3a',

    // Warna teks
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
  },
};

// Tema terang (standar Ant Design)
const customLightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {}
};
// --- AKHIR TEMA KUSTOM ---


export default function App() {
  const { theme: themeMode } = useTheme();
  const antdTheme = themeMode === 'dark' ? customDarkTheme : customLightTheme;

  return (
    <ConfigProvider theme={antdTheme}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operasional']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* ... (Semua rute Anda) ... */}
          <Route path="admin" element={ <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute> } />
          <Route path="admin/settings" element={ <ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute> } />
          <Route path="operasional" element={ <ProtectedRoute allowedRoles={['operasional']}><OperationalDashboard /></ProtectedRoute> } />
          <Route path="operasional/settings" element={ <ProtectedRoute allowedRoles={['operasional']}><UserSettingsPage /></ProtectedRoute> } />
          <Route path="proses-rekonsiliasi" element={ <ProtectedRoute allowedRoles={['operasional']}><ProsesRekonsiliasiPage /></ProtectedRoute> } />
          <Route path="settlement-converter" element={ <ProtectedRoute allowedRoles={['operasional']}><SettlementConverterPage /></ProtectedRoute> } />
          <Route path="riwayat-recon" element={ <ProtectedRoute allowedRoles={['admin', 'operasional']}><ResultHistoryPage /></ProtectedRoute> } />

          <Route index element={<NavigateToDashboard />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

function NavigateToDashboard() {
  const { user } = useAuth(); 
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'operasional') return <Navigate to="/operasional" replace />;
  return <Navigate to="/login" replace />; 
}