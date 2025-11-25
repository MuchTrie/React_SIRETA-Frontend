import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, MoonFilled, SunFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
// Background image (place `admin-ajax.png` in `src/assets/images/`)
import bgImage from '../assets/images/admin-ajax.png';

const { Title } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form] = Form.useForm();

  // Theme colors
  const bgColor = theme === 'dark' ? '#1c1c27' : '#f0f2f5';
  // cardBgColor removed (we apply transparency directly to Card style)
  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)';

  const onFinish = async (values: any) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Hanya kirim email, password, dan role (tidak termasuk confirm)
      await register(values.email, values.password, values.role);
      setSuccess('Registrasi berhasil! Anda akan diarahkan ke dashboard.');
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Registrasi gagal. Coba lagi.';
      setError(errorMsg);
      console.error('Register error:', err);
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
          width: 450,
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
          <Title level={2} style={{ 
            textAlign: 'center', 
            color: theme === 'dark' ? '#ffffff' : '#2E9FD9',
            fontWeight: '700',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
           Registrasi Akun
          </Title>
          
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
          {success && <Alert message={success} type="success" showIcon style={{ marginBottom: 24 }} />}

          <Form
            form={form}
            name="register_form"
            onFinish={onFinish}
            scrollToFirstError
          >
            <Form.Item
              name="email"
              rules={[
                { type: 'email', message: 'Email tidak valid!' },
                { required: true, message: 'Silakan masukkan email Anda!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Silakan masukkan password Anda!' },
                { min: 6, message: 'Password minimal 6 karakter!' }
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password (minimal 6 karakter)" />
            </Form.Item>

            <Form.Item
              name="confirm"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Silakan konfirmasi password Anda!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Password tidak cocok!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Konfirmasi Password" />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: 'Silakan pilih role Anda!' }]}
            >
              <Select placeholder="Pilih Role">
                <Option value="operasional">Operasional</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Daftar
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ color: textColor }}>Sudah punya akun? </span>
              <a href="/login" style={{ 
                color: '#1890ff',
                textDecoration: 'underline',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#40a9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1890ff';
              }}
              >Login disini</a>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}