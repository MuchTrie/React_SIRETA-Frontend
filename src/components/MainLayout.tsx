import React from 'react';
import { Layout, Menu, Button, Switch } from 'antd'; // 1. Tambah Switch
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
} from '@ant-design/icons';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext'; // 3. Import useTheme

const { Header, Content, Footer } = Layout;
const { Sider } = Layout; 

export default function MainLayout() {
  const { user, logout, settings } = useAuth(); 
  const { theme, toggleTheme } = useTheme(); // 4. Dapatkan state & fungsi tema
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/settings')) return 'admin_settings'; 
    if (path.startsWith('/admin')) return 'admin_dashboard';
    if (path.startsWith('/operasional')) return 'ops_dashboard';
    if (path.startsWith('/proses-rekonsiliasi')) return 'process';
    if (path.startsWith('/riwayat-recon')) return 'history';
    if (path.startsWith('/settlement-converter')) return 'converter';
    return 'ops_dashboard';
  };

  return (
    // 5. HAPUS SEMUA style 'background' dari <Layout> ini
    // Biarkan ConfigProvider yang mengaturnya
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        // Hapus 'background: #fff'
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme === 'dark' ? '#3d3d5c' : '#d9d9d9'}`,
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)',
      }}>
        <div style={{ 
          // Hapus 'color: #000'
          fontSize: '20px', 
          fontWeight: 'bold',
          color: 'inherit',
        }}>
          🔄 Switching Reconciliation System
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 6. TAMBAHKAN TOMBOL SWITCH TEMA */}
          <Switch 
            checkedChildren={<MoonFilled />}
            unCheckedChildren={<SunFilled />}
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <span style={{ marginRight: '1rem', color: 'inherit' }}>
            Halo, {user?.role === 'admin' ? 'Admin' : 'Operasional'}
          </span>
          <Button icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </div>
      </Header>

      <Layout> 
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
            style={{ 
              height: '100%', 
              borderRight: 0, 
              paddingTop: 24,
              // Hapus 'background: #fff'
            }}
          >
            {/* Menu Admin */}
            {user?.role === 'admin' && (
              <>
                <Menu.Item key="admin_dashboard" icon={<TeamOutlined />}>
                  <Link to="/admin">Admin Dashboard</Link>
                </Menu.Item>
                <Menu.Item key="admin_settings" icon={<ControlOutlined />}>
                  <Link to="/admin/settings">Settings</Link>
                </Menu.Item>
              </>
            )}

            {/* Menu Operasional (Kondisional) */}
            {user?.role === 'operasional' && (
              <>
                <Menu.Item key="ops_dashboard" icon={<DashboardOutlined />}>
                  <Link to="/operasional">Dashboard</Link>
                </Menu.Item>
                
                {settings?.isProsesReconEnabled && (
                  <Menu.Item key="process" icon={<FileTextOutlined />}>
                    <Link to="/proses-rekonsiliasi">Proses Rekonsiliasi</Link>
                  </Menu.Item>
                )}
                
                {settings?.isConverterEnabled && (
                  <Menu.Item key="converter" icon={<SwapOutlined />}>
                    <Link to="/settlement-converter">Settlement Converter</Link>
                  </Menu.Item>
                )}
              </>
            )}

            {/* Menu Riwayat Recon (Kondisional) */}
            {( 
              (user?.role === 'admin') || 
              (user?.role === 'operasional' && settings?.isHistoryEnabled)
            ) && (
              <Menu.Item key="history" icon={<HistoryOutlined />}>
                <Link to="/riwayat-recon">Riwayat Recon</Link>
              </Menu.Item>
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
              // Hapus 'background: transparent'
            }}
          >
            <Outlet />
          </Content>
          <Footer style={{ 
            textAlign: 'center', 
            // Hapus 'background: transparent'
            paddingTop: 24, 
            paddingBottom: 0 
          }}>
            Switching Reconciliation System ©{new Date().getFullYear()} - Built with React & Go
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}