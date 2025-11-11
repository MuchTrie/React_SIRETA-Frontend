import React, { useState } from 'react';
import { message } from 'antd';
// Sesuaikan path ini ke komponen Anda yang asli
import FileUpload from '../components/FileUpload'; 
import ResultsDisplay from '../components/ResultsDisplay'; 
import { reconciliationAPI } from '../services/api'; 
import type { ReconciliationResult } from '../types'; // Pastikan path ini benar

export default function ProsesRekonsiliasiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);

  const handleUpload = async (files: Record<string, File | File[]>) => {
    if (!files.coreFiles || (Array.isArray(files.coreFiles) && files.coreFiles.length === 0)) {
      message.error('File Core wajib diupload!');
      return;
    }

    setLoading(true);
    
    try {
      const response = await reconciliationAPI.processReconciliation(files as any);
      
      if (response.success) {
        message.success('Rekonsiliasi berhasil diproses!');
        setResult(response.data as ReconciliationResult);
      } else {
        message.error(response.message || 'Gagal memproses rekonsiliasi');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Terjadi kesalahan saat memproses rekonsiliasi');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string) => {
    // Pastikan URL dari backend sudah benar
    window.open(`http://localhost:8080${url}`, '_blank');
  };

  const handleReset = () => {
    setResult(null);
  };

  // Logika render konten sekarang ada di sini
  if (!result) {
    return <FileUpload onUpload={handleUpload} loading={loading} />;
  }
  return (
    <ResultsDisplay result={result} onDownload={handleDownload} onReset={handleReset} />
  );
}