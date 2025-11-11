import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Button, message, Spin } from 'antd';
// Impor API (palsu) yang baru saja kita buat
import { getSettings, updateSettings, FeatureSettings } from '../services/settingsApi';

const { Title, Text } = Typography;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<FeatureSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      message.success('Pengaturan berhasil disimpan!');
    } catch (error) {
      message.error('Gagal menyimpan pengaturan!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spin tip="Memuat Pengaturan..." />;
  }

  if (!settings) {
    return <Text type="danger">Tidak dapat memuat pengaturan.</Text>;
  }

  return (
    <Card>
      <Title level={2}>Pengaturan Fitur</Title>
      <Text type="secondary">Aktifkan atau nonaktifkan fitur yang dapat diakses oleh user operasional.</Text>
      
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
      
      <Button 
        type="primary" 
        style={{ marginTop: 24 }} 
        onClick={handleSaveChanges}
        loading={saving}
      >
        Simpan Perubahan
      </Button>
    </Card>
  );
}

// Anda bisa pindahkan ini ke App.css jika mau
const styles = {
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  }
};