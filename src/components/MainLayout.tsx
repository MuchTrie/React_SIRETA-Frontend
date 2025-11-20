import { useState } from 'react';
import { Layout, Menu, Button, Modal, Typography, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SwapOutlined,
  TeamOutlined,
  LogoutOutlined,
  ControlOutlined,
  MoonFilled,
  SunFilled,
  LockOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext';
// Import logo yang sudah Anda masukkan
import logoLight from '../assets/images/SIRETALIGHT.png';
import logoDark from '../assets/images/SIRETADARK.png';

const { Header, Content, Footer } = Layout;
const { Sider } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const { user, logout, settings } = useAuth(); 
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState('');

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

  // Handler untuk menu yang di-lock (operasional only)
  const handleLockedMenuClick = (featureName: string) => {
    setBlockedFeature(featureName);
    setShowWarningModal(true);
  };

  // Handler untuk menu click
  const handleMenuClick = (e: any) => {
    const key = e.key;
    
    // Jika operasional, cek apakah fitur di-lock
    if (user?.role === 'operasional') {
      if (key === 'process' && !settings?.isProsesReconEnabled) {
        handleLockedMenuClick('Proses Rekonsiliasi');
        return;
      }
      if (key === 'converter' && !settings?.isConverterEnabled) {
        handleLockedMenuClick('Settlement Converter');
        return;
      }
      if (key === 'history' && !settings?.isHistoryEnabled) {
        handleLockedMenuClick('Riwayat Rekonsiliasi');
        return;
      }
    }
    
    // Jika tidak di-lock, navigate normal
    const routes: Record<string, string> = {
      admin_dashboard: '/admin',
      admin_settings: '/admin/settings',
      ops_dashboard: '/operasional',
      ops_settings: '/operasional/settings',
      process: '/proses-rekonsiliasi',
      converter: '/settlement-converter',
      history: '/riwayat-recon',
    };
    
    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  return (
    // 5. HAPUS SEMUA style 'background' dari <Layout> ini
    // Biarkan ConfigProvider yang mengaturnya
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme === 'dark' ? '#3d3d5c' : '#d9d9d9'}`,
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)',
        background: `${theme === 'dark' ? '#001529' : '#ffffff'} !important`,
        backgroundColor: `${theme === 'dark' ? '#001529' : '#ffffff'} !important`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        <div 
          onClick={() => {
            const dashboardRoute = user?.role === 'admin' ? '/admin' : '/operasional';
            navigate(dashboardRoute);
          }}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '20px', 
            fontWeight: 'bold',
            color: 'inherit',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            const textElement = e.currentTarget.querySelector('.title-text') as HTMLElement;
            if (textElement) textElement.style.color = '#1890ff';
          }}
          onMouseLeave={(e) => {
            const textElement = e.currentTarget.querySelector('.title-text') as HTMLElement;
            if (textElement) textElement.style.color = '#2E9FD9';
          }}
        >
          <img 
            src={theme === 'dark' ? logoDark : logoLight} 
            alt="Logo" 
            style={{ 
              width: '48px', 
              height: '48px',
              flexShrink: 0,
              objectFit: 'contain' // Menjaga aspect ratio logo dengan warna asli
            }} 
          />
          <span className="title-text" style={{ 
            color: '#2E9FD9',
            fontWeight: '700',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Sistem Rekonsiliasi Data
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Theme Toggle - Icon Only dengan warna */}
          <Button
            type="text"
            icon={theme === 'dark' ? 
              <SunFilled style={{ color: '#fadb14' }} /> : // Kuning untuk matahari
              <MoonFilled style={{ color: '#1890ff' }} />   // Biru untuk bulan
            }
            onClick={toggleTheme}
            style={{
              border: 'none',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          />
          
          {/* Profil User dengan Avatar dan Dropdown */}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: 'Pengaturan',
                  onClick: () => {
                    // Navigate ke halaman settings
                    const settingsRoute = user?.role === 'admin' ? '/admin/settings' : '/operasional/settings';
                    navigate(settingsRoute);
                  }
                },
                {
                  type: 'divider',
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Logout',
                  onClick: logout
                }
              ]
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Space style={{ cursor: 'pointer', color: 'inherit' }}>
              <Avatar 
                size="default" 
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: '#2E9FD9',
                  color: '#fff'
                }}
              />
              <span style={{ color: 'inherit' }}>
                {user?.role === 'admin' ? 'Admin' : 'Operasional'}
              </span>
            </Space>
          </Dropdown>
        </div>
      </Header>

      <Layout style={{ marginTop: '64px' }}> 
        <Sider
          width={250}
          style={{ 
            // Hapus 'background: #fff'
            borderRight: `1px solid ${theme === 'dark' ? '#3d3d5c' : '#d9d9d9'}`,
            minHeight: 'calc(100vh - 64px)', 
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            onClick={handleMenuClick}
            style={{ 
              height: '100%', 
              borderRight: 0, 
              paddingTop: 24,
            }}
          >
            {/* Menu Admin - Full Access */}
            {user?.role === 'admin' && (
              <>
                <Menu.Item key="admin_dashboard" icon={<TeamOutlined />}>
                  Dashboard
                </Menu.Item>
                <Menu.Item key="process" icon={<FileTextOutlined />}>
                  Proses Rekonsiliasi
                </Menu.Item>
                <Menu.Item key="converter" icon={<SwapOutlined />}>
                  Settlement Converter
                </Menu.Item>
                <Menu.Item key="history" icon={<HistoryOutlined />}>
                  Riwayat Recon
                </Menu.Item>
                <Menu.Item key="admin_settings" icon={<ControlOutlined />}>
                  Pengaturan
                </Menu.Item>
              </>
            )}

            {/* Menu Operasional - dengan Lock Icons */}
            {user?.role === 'operasional' && (
              <>
                <Menu.Item key="ops_dashboard" icon={<DashboardOutlined />}>
                  Dashboard
                </Menu.Item>
                
                {/* Proses Rekonsiliasi - Show lock jika disabled */}
                <Menu.Item 
                  key="process" 
                  icon={settings?.isProsesReconEnabled ? <FileTextOutlined /> : <LockOutlined />}
                  disabled={!settings?.isProsesReconEnabled}
                  style={{ 
                    color: !settings?.isProsesReconEnabled ? '#bbb' : undefined,
                    cursor: !settings?.isProsesReconEnabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  Proses Rekonsiliasi {!settings?.isProsesReconEnabled && '🔒'}
                </Menu.Item>
                
                {/* Settlement Converter - Show lock jika disabled */}
                <Menu.Item 
                  key="converter" 
                  icon={settings?.isConverterEnabled ? <SwapOutlined /> : <LockOutlined />}
                  disabled={!settings?.isConverterEnabled}
                  style={{ 
                    color: !settings?.isConverterEnabled ? '#bbb' : undefined,
                    cursor: !settings?.isConverterEnabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  Settlement Converter {!settings?.isConverterEnabled && '🔒'}
                </Menu.Item>
                
                {/* Riwayat Recon - Show lock jika disabled */}
                <Menu.Item 
                  key="history" 
                  icon={settings?.isHistoryEnabled ? <HistoryOutlined /> : <LockOutlined />}
                  disabled={!settings?.isHistoryEnabled}
                  style={{ 
                    color: !settings?.isHistoryEnabled ? '#bbb' : undefined,
                    cursor: !settings?.isHistoryEnabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  Riwayat Rekon {!settings?.isHistoryEnabled && '🔒'}
                </Menu.Item>
                
                {/* Pengaturan - Selalu tersedia untuk operasional */}
                <Menu.Item key="ops_settings" icon={<ControlOutlined />}>
                  Pengaturan
                </Menu.Item>
              </>
            )}

          </Menu>
        </Sider>

        <Layout style={{ 
          padding: '24px', 
          // Hapus 'background: #fff' atau '#f0f2f5'
        }}>
          <Content 
            style={{ 
              padding: 0, 
              margin: 0, 
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
          <Footer style={{ 
            textAlign: 'center', 
            paddingTop: 24, 
            paddingBottom: 0 
          }}>
            Sistem Rekonsiliasi Data ©{new Date().getFullYear()} - Built with React & Go
          </Footer>
        </Layout>
      </Layout>

      {/* Warning Modal untuk Fitur yang Di-lock */}
      <Modal
        open={showWarningModal}
        onCancel={() => setShowWarningModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowWarningModal(false)}>
            Mengerti
          </Button>
        ]}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 16 }}>Akses Dibatasi</h3>
          <Text type="secondary">
            Fitur <strong>{blockedFeature}</strong> saat ini tidak dapat diakses.
            <br />
            <br />
            Hubungi administrator untuk mengaktifkan akses ke fitur ini.
          </Text>
        </div>
      </Modal>
    </Layout>
  );
}