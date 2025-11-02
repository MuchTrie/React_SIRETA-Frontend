import axios from 'axios';
import type { APIResponse, ReconciliationResult, UploadFiles } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const reconciliationAPI = {
  // Health check
  healthCheck: async (): Promise<APIResponse> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Process reconciliation with multi-file support
  processReconciliation: async (files: UploadFiles): Promise<APIResponse<ReconciliationResult>> => {
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
    
    // Add vendor files (optional, multiple per vendor)
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
    
    appendMultipleFiles('alto_recon_files', files.altoReconFiles);
    appendMultipleFiles('alto_settlement_files', files.altoSettlementFiles);
    appendMultipleFiles('jalin_recon_files', files.jalinReconFiles);
    appendMultipleFiles('jalin_settlement_files', files.jalinSettlementFiles);
    appendMultipleFiles('aj_recon_files', files.ajReconFiles);
    appendMultipleFiles('aj_settlement_files', files.ajSettlementFiles);
    appendMultipleFiles('rinti_recon_files', files.rintiReconFiles);
    appendMultipleFiles('rinti_settlement_files', files.rintiSettlementFiles);
    
    const response = await apiClient.post('/reconcile', formData);
    return response.data;
  },

  // Download result
  downloadResult: (jobId: string, filename: string): string => {
    return `${API_BASE_URL}/download/${jobId}/${filename}`;
  },
};

export default reconciliationAPI;
