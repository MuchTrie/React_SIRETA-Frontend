import apiClient from './apiClient';
import type { ReconciliationResult } from '../types'; // Pastikan path ini benar

interface ProcessResponse {
  success: boolean;
  message: string;
  data: ReconciliationResult | null;
}

export const reconciliationAPI = {
  /**
   * Memproses file rekonsiliasi
   */
  processReconciliation: async (files: Record<string, File | File[]>): Promise<ProcessResponse> => {
    const formData = new FormData();
    
    // Logika untuk append file (sesuaikan dengan kebutuhan backend Anda)
    // Contoh ini mengasumsikan 'coreFiles' bisa jadi array
    if (files.coreFiles && Array.isArray(files.coreFiles)) {
      files.coreFiles.forEach((file) => {
        formData.append('coreFiles', file);
      });
    }
    // Tambahkan file lain jika ada (misal: vendorFiles)
    if (files.vendorFiles && Array.isArray(files.vendorFiles)) {
      files.vendorFiles.forEach((file) => {
        formData.append('vendorFiles', file);
      });
    }

    const response = await apiClient.post('/reconciliation/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Tambahkan fungsi API lain di sini (misal: getHistory)
};