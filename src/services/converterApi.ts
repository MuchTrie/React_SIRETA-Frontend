import apiClient from './apiClient';

// Tipe data untuk file yang dikonversi (sesuaikan jika perlu)
export interface ConvertedFile {
  filename: string;
  size: number;
  last_modified: string;
}

/**
 * MOCK: Mengambil daftar file yang sudah dikonversi
 * Ganti ini dengan API call ke endpoint Anda (misal: /api/converted/files)
 */
export const getConvertedFiles = async (): Promise<ConvertedFile[]> => {
  console.log("Mock API: Mengambil riwayat file konversi...");
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Di API asli, Anda akan memanggil:
  // const response = await apiClient.get('/api/converted/files');
  // return response.data;

  // --- 👇 DATA PALSU SUDAH DIHAPUS 👇 ---
  // Sekarang akan mengembalikan array kosong
  return [];
};

/**
 * MOCK: Menghapus file yang sudah dikonversi
 * Ganti ini dengan API call ke endpoint Anda (misal: DELETE /api/converted/files/:filename)
 */
export const deleteConvertedFile = async (filename: string): Promise<void> => {
  console.log(`Mock API: Menghapus file ${filename}...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Di API asli, Anda akan memanggil:
  // await apiClient.delete(`/api/converted/files/${filename}`);
  
  console.log("Mock API: File berhasil dihapus.");
  return;
};