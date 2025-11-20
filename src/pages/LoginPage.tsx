import { useState } from 'react';
import { Form, Input, Button, Card, Alert, Spin } from 'antd';
import { UserOutlined, LockOutlined, MoonFilled, SunFilled } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
// Background image (place `admin-ajax.png` in `src/assets/images/`)
import bgImage from '../assets/images/admin-ajax.png';
import logoLight from '../assets/images/SIRETALIGHT.png';
import logoDark from '../assets/images/SIRETADARK.png';

// Title not needed here because we use logo image

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Theme colors
  const bgColor = theme === 'dark' ? '#1c1c27' : '#f0f2f5';
  // cardBgColor removed (we apply transparency directly to Card style)
  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)';

  const onFinish = async (values: any) => {
    setLoading(true);
    setError('');
    
    try {
      await login(values.email, values.password);
      // Jika sukses, navigasi ke halaman utama (App.tsx akan urus sisanya)
      navigate('/'); 
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Email atau password salah.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: `${bgColor} url(${bgImage}) center center / 40% no-repeat`
    }}>
      <Card
        style={{
          width: 400,
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.48)' : 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
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
              backgroundColor: 'transparent',
            }}
          />
        </div>
        <Spin spinning={loading}>
          <div style={{ textAlign: 'center', marginBottom: 32, marginTop: -32 }}>
            <img src={theme === 'dark' ? logoDark : logoLight} alt="Logo" style={{ width: 200, height: 'auto', display: 'inline-block' }} />
          </div>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
          <Form
            name="login_form"
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, type: 'email', message: 'Silakan masukkan email yang valid!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Silakan masukkan password Anda!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Login
              </Button>
            </Form.Item>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ color: textColor }}>Belum punya akun? </span>
              <a href="/register" style={{ 
                color: '#1890ff',
                padding: '4px 12px',
                borderRadius: '4px',
                border: '1px solid #1890ff',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1890ff';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1890ff';
              }}
              >Daftar disini</a>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}