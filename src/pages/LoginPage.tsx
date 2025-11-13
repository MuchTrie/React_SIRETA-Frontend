import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin, Switch } from 'antd';
import { UserOutlined, LockOutlined, MoonFilled, SunFilled } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Theme colors
  const bgColor = theme === 'dark' ? '#1c1c27' : '#f0f2f5';
  const cardBgColor = theme === 'dark' ? '#25254f' : '#ffffff';
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bgColor }}>
      <Card style={{ width: 400, backgroundColor: cardBgColor }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Switch 
            checkedChildren={<MoonFilled />}
            unCheckedChildren={<SunFilled />}
            checked={theme === 'dark'}
            onChange={toggleTheme}
            size="small"
          />
        </div>
        <Spin spinning={loading}>
          <Title level={2} style={{ textAlign: 'center', color: textColor }}>
            Login
          </Title>
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
            
            <div style={{ textAlign: 'center', color: textColor }}>
              Belum punya akun? <a href="/register" style={{ color: '#1890ff' }}>Daftar di sini</a>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}