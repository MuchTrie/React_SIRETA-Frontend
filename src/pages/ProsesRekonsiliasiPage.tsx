import { useState } from 'react';
import { message } from 'antd';
import FileUpload from '../components/FileUpload'; 
import ResultsDisplay from '../components/ResultsDisplay'; 
import { reconciliationAPI } from '../services/api'; 
import type { ReconciliationResult } from '../types';

export default function ProsesRekonsiliasiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');

  // Helper function untuk memastikan progress selalu integer 0-100
  const updateProgress = (value: number) => {
    const clampedValue = Math.max(0, Math.min(100, Math.floor(value)));
    setUploadProgress(clampedValue);
  };

  const handleUpload = async (files: Record<string, File | File[]>) => {
    if (!files.coreFiles || (Array.isArray(files.coreFiles) && files.coreFiles.length === 0)) {
      message.error('File Core wajib diupload!');
      return;
    }

    setLoading(true);
    updateProgress(0);
    setProcessingStage('Mengunggah file...');
    
    try {
      // Simulasi progress upload
      updateProgress(10);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      updateProgress(20);
      setProcessingStage('Memvalidasi file...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(35);
      setProcessingStage('Memproses rekonsiliasi...');
      
      // Simulasi progress selama API call
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 70) {
            const increment = Math.floor(Math.random() * 3) + 1; // 1-3 integer
            const newProgress = Math.min(prev + increment, 70); // Maksimal 70
            return newProgress;
          }
          return prev;
        });
      }, 800);
      
      const response = await reconciliationAPI.processReconciliation(files as any);
      
      // Clear interval dan set progress ke tahap akhir
      clearInterval(progressInterval);
      updateProgress(85);
      setProcessingStage('Finalisasi hasil...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (response.success) {
        updateProgress(100);
        setProcessingStage('Selesai!');
        await new Promise(resolve => setTimeout(resolve, 500));
        message.success('Rekonsiliasi berhasil diproses!');
        setResult(response.data as ReconciliationResult);
      } else {
        message.error(response.message || 'Gagal memproses rekonsiliasi');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Terjadi kesalahan saat memproses rekonsiliasi');
    } finally {
      setLoading(false);
      updateProgress(0);
      setProcessingStage('');
    }
  };

  const handleDownload = async (url: string) => {
    try {
      message.loading({ content: 'Mengunduh file...', key: 'download' });
      // Extract jobId and filename from URL path
      // URL format: /api/download/{jobId}/{filename}
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const jobId = urlParts[urlParts.length - 2];
      
      const blob = await reconciliationAPI.downloadResult(jobId, filename);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      message.success({ content: `File ${filename} berhasil di-download!`, key: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      message.error({ content: 'Gagal mengunduh file', key: 'download' });
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  // Logika render konten sekarang ada di sini
  if (!result) {
    return <FileUpload onUpload={handleUpload} loading={loading} uploadProgress={uploadProgress} processingStage={processingStage} />;
  }
  return (
    <ResultsDisplay result={result} onDownload={handleDownload} onReset={handleReset} />
  );
}