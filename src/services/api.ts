import apiClient from './apiClient';
import type { ReconciliationResult, UploadFiles } from '../types';

interface ProcessResponse {
  success: boolean;
  message: string;
  data: ReconciliationResult | null;
}

interface ConversionResult {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    total_records: number;
    preview_records: any[];
    download_url: string;
  };
  error?: string;
}

interface ConvertedFile {
  filename: string;
  size: number;
  modified_at: string;
  download_url: string;
}

interface JobFolder {
  name: string;
  files: string[];
}

export const reconciliationAPI = {
  /**
   * Health check
   */
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  /**
   * Memproses file rekonsiliasi dengan multi-file support
   */
  processReconciliation: async (files: UploadFiles): Promise<ProcessResponse> => {
    const formData = new FormData();
    
    // Add core files (required, multiple)
    if (files.coreFiles) {
      if (Array.isArray(files.coreFiles)) {
        files.coreFiles.forEach(file => {
          formData.append('core_files', file);
        });
      } else {
        formData.append('core_files', files.coreFiles);
      }
    }
    
    // Helper function to append multiple files
    const appendMultipleFiles = (key: string, fileOrFiles: File | File[] | undefined) => {
      if (!fileOrFiles) return;
      
      if (Array.isArray(fileOrFiles)) {
        fileOrFiles.forEach(file => {
          formData.append(key, file);
        });
      } else {
        formData.append(key, fileOrFiles);
      }
    };
    
    // Add vendor files (optional, multiple per vendor)
    appendMultipleFiles('alto_recon_files', files.altoReconFiles);
    appendMultipleFiles('alto_settlement_files', files.altoSettlementFiles);
    appendMultipleFiles('jalin_recon_files', files.jalinReconFiles);
    appendMultipleFiles('jalin_settlement_files', files.jalinSettlementFiles);
    appendMultipleFiles('aj_recon_files', files.ajReconFiles);
    appendMultipleFiles('aj_settlement_files', files.ajSettlementFiles);
    appendMultipleFiles('rinti_recon_files', files.rintiReconFiles);
    appendMultipleFiles('rinti_settlement_files', files.rintiSettlementFiles);
    
    const response = await apiClient.post('/reconcile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Get result folders (history)
   */
  getResultFolders: async (): Promise<{ success: boolean; data: JobFolder[] }> => {
    const response = await apiClient.get('/results');
    return response.data;
  },

  /**
   * Get specific result data
   */
  getResultData: async (jobId: string, vendor: string, type: 'recon' | 'settlement') => {
    const response = await apiClient.get(`/results/${jobId}/${vendor}/${type}`);
    return response.data;
  },

  /**
   * Download result file with proper authentication
   */
  downloadResult: async (jobId: string, filename: string): Promise<Blob> => {
    const response = await apiClient.get(`/download/${jobId}/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const settlementAPI = {
  /**
   * Convert settlement file
   */
  convertSettlement: async (file: File): Promise<ConversionResult> => {
    const formData = new FormData();
    formData.append('settlement_file', file);

    const response = await apiClient.post('/convert/settlement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Get list of converted files
   */
  getConvertedFiles: async (): Promise<{ success: boolean; data: ConvertedFile[] }> => {
    const response = await apiClient.get('/converted/files');
    return response.data;
  },

  /**
   * Download converted file with proper authentication
   */
  downloadConverted: async (filename: string): Promise<Blob> => {
    const response = await apiClient.get(`/download/converted/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Preview converted file
   */
  previewConverted: async (filename: string): Promise<ConversionResult> => {
    const response = await apiClient.get(`/preview/converted/${filename}`);
    return response.data;
  },
};