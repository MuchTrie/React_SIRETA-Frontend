import apiClient from './apiClient';

// Tipe untuk data settings
export interface FeatureSettings {
  isProsesReconEnabled: boolean;
  isConverterEnabled: boolean;
  isHistoryEnabled: boolean;
}

// -----------------------------------------------------
// --- API PALSU (MOCK API) UNTUK TESTING ---
// -----------------------------------------------------
// Kita simpan pengaturan di memori browser
let mockSettings: FeatureSettings = {
  isProsesReconEnabled: true,
  isConverterEnabled: true,
  isHistoryEnabled: true,
};

/**
 * MOCK: Mengambil pengaturan
 */
export const getSettings = async (): Promise<FeatureSettings> => {
  console.log("Mock API: Mengambil pengaturan...");
  // Mensimulasikan penundaan jaringan
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Di API asli, Anda akan memanggil:
  // const response = await apiClient.get('/settings');
  // return response.data;
  
  return { ...mockSettings };
};

/**
 * MOCK: Memperbarui pengaturan
 */
export const updateSettings = async (newSettings: FeatureSettings): Promise<FeatureSettings> => {
  console.log("Mock API: Memperbarui pengaturan...", newSettings);
  // Mensimulasikan penundaan jaringan
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  mockSettings = { ...newSettings };
  
  // Di API asli, Anda akan memanggil:
  // const response = await apiClient.post('/settings', newSettings);
  // return response.data;

  return { ...mockSettings };
};