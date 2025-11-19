import { useState } from 'react';
import { Card, Typography, Form, Input, Button, Alert, Spin } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateProfile, changePassword } from '../services/profileApi';

const { Title } = Typography;

export default function UserSettingsPage() {
  // Profile settings state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [profileForm] = Form.useForm();
  
  // Theme colors - menggunakan ConfigProvider
  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)';

  // Profile update functions
  const onFinishProfile = async (values: any) => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await updateProfile({
        username: values.username,
        email: values.email
      });

      if (response.success && response.data) {
        // Update user in context
        updateUser({ 
          ...user, 
          username: response.data.username, 
          email: response.data.email 
        });
        
        // If email changed, new token is provided
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        setProfileSuccess('Profil berhasil diperbarui!');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal memperbarui profil.';
      setProfileError(errorMsg);
      console.error('Update profile error:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const onFinishPassword = async (values: any) => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      if (response.success) {
        setProfileSuccess('Password berhasil diubah!');
        profileForm.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal mengubah password.';
      setProfileError(errorMsg);
      console.error('Change password error:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2} style={{ color: textColor, marginBottom: '24px' }}>
        Pengaturan Profil
      </Title>

      {profileSuccess && <Alert message={profileSuccess} type="success" showIcon style={{ marginBottom: 24 }} />}
      {profileError && <Alert message={profileError} type="error" showIcon style={{ marginBottom: 24 }} />}

      {/* Profile Information */}
      <Card 
        title="Informasi Profil" 
        style={{ marginBottom: '24px' }}
      >
        <Spin spinning={profileLoading}>
          <Form
            layout="vertical"
            onFinish={onFinishProfile}
            initialValues={{
              username: user.username || user.email?.split('@')[0],
              email: user.email
            }}
          >
            <Form.Item
              label={<span style={{ color: textColor }}>Username</span>}
              name="username"
              rules={[
                { required: true, message: 'Username harus diisi!' },
                { min: 3, message: 'Username minimal 3 karakter!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Masukkan username" 
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: textColor }}>Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Email harus diisi!' },
                { type: 'email', message: 'Format email tidak valid!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Masukkan email" 
              />
            </Form.Item>



            <Form.Item>
              <Button type="primary" htmlType="submit" loading={profileLoading}>
                Simpan Perubahan Profil
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>

      {/* Change Password */}
      <Card 
        title="Ubah Password"
      >
        <Spin spinning={profileLoading}>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={onFinishPassword}
          >
            <Form.Item
              label={<span style={{ color: textColor }}>Password Saat Ini</span>}
              name="currentPassword"
              rules={[{ required: true, message: 'Password saat ini harus diisi!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Masukkan password saat ini" 
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: textColor }}>Password Baru</span>}
              name="newPassword"
              rules={[
                { required: true, message: 'Password baru harus diisi!' },
                { min: 6, message: 'Password minimal 6 karakter!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Masukkan password baru" 
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: textColor }}>Konfirmasi Password Baru</span>}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Konfirmasi password harus diisi!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Password tidak cocok!'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Konfirmasi password baru" 
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={profileLoading}>
                Ubah Password
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}