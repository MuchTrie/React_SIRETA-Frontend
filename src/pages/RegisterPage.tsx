import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin, Select, Switch } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, MoonFilled, SunFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
  const cardBgColor = theme === 'dark' ? '#25254f' : '#ffffff';
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bgColor }}>
      <Card style={{ width: 450, backgroundColor: cardBgColor }}>
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
           Daftar Akun Baru
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

            <div style={{ textAlign: 'center', color: textColor }}>
              Sudah punya akun? <a href="/login" style={{ color: '#1890ff' }}>Login di sini</a>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}