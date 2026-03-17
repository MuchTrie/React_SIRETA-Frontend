import { useState } from 'react';
import { Form, Input, Button, Card, Alert, Spin } from 'antd';
import { UserOutlined, LockOutlined, MoonFilled, SunFilled } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
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
  const isDark = theme === 'dark';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)';

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
    <div className={`login-page ${isDark ? 'login-page-dark' : 'login-page-light'}`}>
      <Card
        className={`login-card ${isDark ? 'login-card-dark' : 'login-card-light'}`}
        bordered={false}
      >
        <div className="login-header">
          <Button
            type="text"
            icon={theme === 'dark' ? 
              <SunFilled style={{ color: '#fadb14' }} /> : // Kuning untuk matahari
              <MoonFilled style={{ color: '#1890ff' }} />   // Biru untuk bulan
            }
            onClick={toggleTheme}
            className="login-theme-toggle"
          />
        </div>
        <Spin spinning={loading}>
          <div className="login-logo-wrapper">
            <img
              src={theme === 'dark' ? logoDark : logoLight}
              alt="Logo"
              className="login-logo"
            />
           
          </div>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
          <Form
            name="login_form"
            onFinish={onFinish}
            className="login-form"
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
              <Button type="primary" htmlType="submit">
                Login
              </Button>
            </Form.Item>

            <div className="login-extra-text">
              <span style={{ color: textColor }}>Belum punya akun? </span>
              <a href="/register">Daftar disini</a>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}