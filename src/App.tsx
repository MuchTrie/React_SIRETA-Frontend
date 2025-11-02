import React, { useState } from 'react';
import { Layout, message, Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import ResultHistory from './components/ResultHistory';
import SettlementConverter from './components/SettlementConverter';
import { reconciliationAPI } from './services/api';
import type { ReconciliationResult } from './types';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

type MenuKey = 'dashboard' | 'process' | 'history' | 'converter';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [currentPage, setCurrentPage] = useState<MenuKey>('dashboard');

  const handleUpload = async (files: Record<string, File | File[]>) => {
    console.log('Files received:', files);
    console.log('Core files exists:', !!files.coreFiles);
    
    if (!files.coreFiles || (Array.isArray(files.coreFiles) && files.coreFiles.length === 0)) {
      message.error('File Core wajib diupload!');
      console.error('Core files are missing in files object');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Sending request to API...');
      const response = await reconciliationAPI.processReconciliation(files as any);
      console.log('API Response:', response);
      
      if (response.success) {
        message.success('Rekonsiliasi berhasil diproses!');
        setResult(response.data as ReconciliationResult);
      } else {
        message.error(response.message || 'Gagal memproses rekonsiliasi');
      }
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error details:', error.response?.data);
      message.error(error.response?.data?.message || 'Terjadi kesalahan saat memproses rekonsiliasi');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string) => {
    window.open(`http://localhost:8080${url}`, '_blank');
  };

  const handleReset = () => {
    setResult(null);
  };

  const handleMenuClick = (key: MenuKey) => {
    setCurrentPage(key);
    // Reset results when switching to history or dashboard page
    if (key !== 'process') {
      setResult(null);
    }
  };

  const renderContent = () => {
    if (currentPage === 'dashboard') {
      return <Dashboard />;
    }

    if (currentPage === 'process') {
      if (!result) {
        return <FileUpload onUpload={handleUpload} loading={loading} />;
      }
      return (
        <ResultsDisplay result={result} onDownload={handleDownload} onReset={handleReset} />
      );
    }

    if (currentPage === 'history') {
      return <ResultHistory />;
    }

    if (currentPage === 'converter') {
      return <SettlementConverter />;
    }

    return null;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#1890ff', padding: '0 50px' }}>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
          🔄 Switching Reconciliation System
        </div>
      </Header>
      
      <Layout>
        <Sider
          width={250}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[currentPage]}
            style={{ height: '100%', borderRight: 0, paddingTop: 24 }}
            items={[
              {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
                onClick: () => handleMenuClick('dashboard'),
              },
              {
                key: 'process',
                icon: <FileTextOutlined />,
                label: 'Proses Rekonsiliasi',
                onClick: () => handleMenuClick('process'),
              },
              {
                key: 'history',
                icon: <HistoryOutlined />,
                label: 'Riwayat Recon',
                onClick: () => handleMenuClick('history'),
              },
              {
                key: 'converter',
                icon: <SwapOutlined />,
                label: 'Settlement Converter',
                onClick: () => handleMenuClick('converter'),
              },
            ]}
          />
        </Sider>
        
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{ padding: 24, margin: 0, minHeight: 280, background: '#fff' }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
      
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        Switching Reconciliation System ©{new Date().getFullYear()} - Built with React & Go
      </Footer>
    </Layout>
  );
};

export default App;
