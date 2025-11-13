import { Layout, Menu, Switch } from 'antd'; 
import {
  FileSearchOutlined,
  HistoryOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserSwitchOutlined,
  BarChartOutlined,
  MoonFilled,
  SunFilled,
} from '@ant-design/icons';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext'; 
import Profile from './Profile';
import { useState, useEffect } from 'react';

const { Header, Content, Footer, Sider } = Layout; 

export default function MainLayout() {
  const { user, settings } = useAuth(); 
  const { theme, toggleTheme } = useTheme(); 
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll untuk header effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 👇 PERBAIKAN DI SINI 👇 ---
  // Warna untuk Header dan Sider (sesuai kode Anda)
  const bgColor = theme === 'dark' ? '#25254f' : '#ffffff';
  // Warna untuk Latar Belakang Konten (sesuai gambar: paling gelap)
  const contentBgColor = theme === 'dark' ? '#1c1c27' : '#f0f2f5'; 
  // Warna Border
  const borderColor = theme === 'dark' ? '#3d3d5c' : '#d9d9d9';
  // Warna Teks
  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)';
  // --- 👆 AKHIR PERBAIKAN 👆 ---

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/settings')) return 'admin_settings'; 
    if (path.startsWith('/admin')) return 'admin_dashboard';
    if (path.startsWith('/operasional/settings')) return 'ops_settings';
    if (path.startsWith('/operasional')) return 'ops_dashboard';
    if (path.startsWith('/proses-rekonsiliasi')) return 'process';
    if (path.startsWith('/riwayat-recon')) return 'history';
    if (path.startsWith('/settlement-converter')) return 'converter';

    return 'ops_dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      <Sider
        width={250}
        style={{ 
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          overflow: 'auto', 
          backgroundColor: bgColor, // <-- Menggunakan bgColor
          borderRight: `1px solid ${borderColor}`,
        }}
      >
        <Link 
          to={user?.role === 'admin' ? '/admin' : '/operasional'}
          style={{ textDecoration: 'none', color: textColor, cursor: 'pointer' }}
        >
          <div style={{ 
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: textColor, // <-- Menggunakan textColor
            borderBottom: `1px solid ${borderColor}`, // <-- Menggunakan borderColor
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
          }}>
          CMI Switching Reconciliation
          </div>
        </Link>
        
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          style={{ 
            height: 'calc(100% - 64px)',
            borderRight: 0, 
            backgroundColor: 'transparent', // <-- Buat transparan agar bgColor Sider terlihat
          }}
        >
          {/* ... (Menu item Anda tidak berubah) ... */}
          {user?.role === 'admin' && (
            <>
              <Menu.Item key="admin_dashboard" icon={<UserSwitchOutlined />}>
                <Link to="/admin">Admin Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="admin_settings" icon={<SettingOutlined />}>
                <Link to="/admin/settings">Settings</Link>
              </Menu.Item>
            </>
          )}
          {user?.role === 'operasional' && (
            <>
              <Menu.Item key="ops_dashboard" icon={<BarChartOutlined />}>
                <Link to="/operasional">Dashboard</Link>
              </Menu.Item>
              {settings?.isProsesReconEnabled && (
                <Menu.Item key="process" icon={<FileSearchOutlined />}>
                  <Link to="/proses-rekonsiliasi">Proses Rekonsiliasi</Link>
                </Menu.Item>
              )}
              {settings?.isConverterEnabled && (
                <Menu.Item key="converter" icon={<AppstoreOutlined />}>
                  <Link to="/settlement-converter">Settlement Converter</Link>
                </Menu.Item>
              )}
              <Menu.Item key="ops_settings" icon={<SettingOutlined />}>
                <Link to="/operasional/settings">Pengaturan</Link>
              </Menu.Item>
            </>
          )}
          {( (user?.role === 'admin') || (user?.role === 'operasional' && settings?.isHistoryEnabled)) && (
            <Menu.Item key="history" icon={<HistoryOutlined />}>
              <Link to="/riwayat-recon">Riwayat Recon</Link>
            </Menu.Item>
          )}

        </Menu>
      </Sider>

      <Layout style={{ marginLeft: 250 }}> 
        
        <Header style={{ 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          backgroundColor: bgColor, // <-- Menggunakan bgColor
          borderBottom: `1px solid ${borderColor}`, // <-- Menggunakan borderColor
          color: textColor, // <-- Menggunakan textColor
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: isScrolled 
            ? (theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)')
            : '0 1px 0 rgba(0, 0, 0, 0.06)',
          transition: 'box-shadow 0.3s ease',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Switch 
              checkedChildren={<MoonFilled />}
              unCheckedChildren={<SunFilled />}
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <Profile />
          </div>
        </Header>

        {/* --- 👇 PERBAIKAN DI SINI 👇 --- */}
        <Layout style={{ 
          padding: '24px', 
          backgroundColor: contentBgColor, // <-- Terapkan warna latar konten
        }}>
          <Content style={{ 
            padding: 0, 
            margin: 0, 
            minHeight: 280, 
            background: 'transparent' // <-- Buat transparan
          }}>
            <Outlet />
          </Content>
          <Footer style={{ 
            textAlign: 'center', 
            paddingTop: 24, 
            paddingBottom: 0,
            background: 'transparent' // <-- Buat transparan
          }}>
            Switching Reconciliation System ©{new Date().getFullYear()} - Built with React & Go
          </Footer>
        </Layout>
        {/* --- 👆 AKHIR PERBAIKAN 👆 --- */}
      </Layout>
    </Layout>
  );
}