import { useState, useEffect } from 'react';
import { Card, Typography, Switch, Button, message, Spin, Form, Input, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
// Impor API (palsu) yang baru saja kita buat
import { getSettings, updateSettings, FeatureSettings } from '../services/settingsApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const { Title, Text } = Typography;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<FeatureSettings | null>(null);
  const [loading, setLoading] = useState(true); // Ini untuk loading awal
  const [saving, setSaving] = useState(false); // Ini untuk saat klik simpan
  
  // Profile settings state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  
  // Password settings state (separate from profile)
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { user, updateUser, refreshSettings } = useAuth();
  const { theme } = useTheme();
  const [profileForm] = Form.useForm();
  
  // Theme colors - menggunakan ConfigProvider
  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)';

  // Auto-dismiss success messages after 5 seconds
  useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => {
        setProfileSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess]);

  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => {
        setPasswordSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);

  // Mengambil data settings saat halaman dimuat
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const currentSettings = await getSettings(); // Memanggil API
        setSettings(currentSettings);
      } catch (error) {
        message.error('Gagal memuat pengaturan!');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Memperbarui state saat toggle diubah
  const handleToggle = (key: keyof FeatureSettings, value: boolean) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  // Menyimpan perubahan ke backend (palsu)
  const handleSaveChanges = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSettings(settings); // Memanggil API
      await refreshSettings(); // Refresh settings di AuthContext
      message.success('Pengaturan berhasil disimpan!');
    } catch (error) {
      message.error('Gagal menyimpan pengaturan!');
    } finally {
      setSaving(false);
    }
  };

  // Profile update functions
  const onFinishProfile = async (values: any) => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:8080/api/profile', {
        username: values.username,
        email: values.email
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        updateUser({ ...user, username: values.username, email: values.email });
        setProfileSuccess('Profil berhasil diperbarui!');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal memperbarui profil.';
      setProfileError(errorMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  const onFinishPassword = async (values: any) => {
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:8080/api/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPasswordSuccess('Password berhasil diubah!');
        profileForm.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal mengubah password.';
      setPasswordError(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- 👇 PERBAIKAN LOGIKA RENDER DI SINI 👇 ---
  // Kita bungkus semua dengan <Spin>
  // 'spinning' akan dikontrol oleh state 'loading'
  // Ini akan memperbaiki warning kuning Anda

  return (
    <Spin spinning={loading} tip="Memuat Pengaturan...">
      <Card>
        <Title level={2}>Pengaturan Fitur</Title>
        <Text type="secondary">Aktifkan atau nonaktifkan fitur yang dapat diakses oleh user operasional.</Text>
        
        {/* Kita tambahkan pengecekan: 
          Hanya tampilkan tombol jika loading SELESAI dan settings ADA
        */}
        {!loading && settings ? (
          <div style={{ marginTop: 24 }}>
            <div style={styles.settingItem}>
              <Text strong>Proses Rekonsiliasi</Text>
              <Switch 
                checked={settings.isProsesReconEnabled}
                onChange={(checked) => handleToggle('isProsesReconEnabled', checked)}
              />
            </div>
            <div style={styles.settingItem}>
              <Text strong>Settlement Converter</Text>
              <Switch
                checked={settings.isConverterEnabled}
                onChange={(checked) => handleToggle('isConverterEnabled', checked)}
              />
            </div>
            <div style={styles.settingItem}>
              <Text strong>Riwayat Recon</Text>
              <Switch
                checked={settings.isHistoryEnabled}
                onChange={(checked) => handleToggle('isHistoryEnabled', checked)}
              />
            </div>
          </div>
        ) : (
          // Tampilkan ini jika loading selesai TAPI settings gagal dimuat
          !loading && !settings && (
            <div style={{ padding: '20px 0' }}>
              <Text type="danger">Tidak dapat memuat pengaturan.</Text>
            </div>
          )
        )}
        
        <Button 
          type="primary" 
          style={{ marginTop: 24 }} 
          onClick={handleSaveChanges}
          loading={saving} // 'loading' di sini untuk tombol "Simpan"
          disabled={loading || !settings} // Nonaktifkan tombol jika masih loading awal
        >
          Simpan Perubahan
        </Button>
      </Card>

      {/* Profile Settings Section */}
      <div style={{ marginTop: '24px' }}>
        <Title level={2} style={{ color: textColor, marginBottom: '24px' }}>
          Pengaturan Profil
        </Title>

        {/* Profile Information */}
        <Card 
          title="Informasi Profil" 
          style={{ marginBottom: '24px' }}
        >
          {profileSuccess && <Alert message={profileSuccess} type="success" showIcon style={{ marginBottom: 16 }} />}
          {profileError && <Alert message={profileError} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Spin spinning={profileLoading}>
            {user && (
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
            )}
          </Spin>
        </Card>

        {/* Change Password */}
        <Card 
          title="Ubah Password"
        >
          {passwordSuccess && <Alert message={passwordSuccess} type="success" showIcon style={{ marginBottom: 16 }} />}
          {passwordError && <Alert message={passwordError} type="error" showIcon style={{ marginBottom: 16 }} />}
          
          <Spin spinning={passwordLoading}>
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
                <Button type="primary" htmlType="submit" loading={passwordLoading}>
                  Ubah Password
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </Card>
      </div>
    </Spin>
  );
  // --- 👆 AKHIR PERBAIKAN 👆 ---
}

const styles = {
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  }
};