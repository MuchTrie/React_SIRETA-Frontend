// Types for API responses
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ReconciliationResult {
  job_id: string;
  status: string;
  message: string;
  processed_at: string;
  total_records: number;
  vendors: VendorResult[];
  download_urls?: Record<string, string>;
}

export interface VendorResult {
  vendor: string;
  recon_results?: ReconciliationData[];
  settlement_results?: SettlementData[];
  recon_match_count: number;
  recon_mismatch_count: number;
  settlement_match_count: number;
  settlement_mismatch_count: number;
}

export interface ReconciliationData {
  rrn: string;
  reff: string;
  status: string;
  merchant_pan: string;
  merchant_criteria: string;
  invoice_number: string;
  created_date: string;
  created_time: string;
  process_code: string;
  match_status: 'MATCH' | 'ONLY_IN_CORE' | 'ONLY_IN_SWITCHING';
  source: 'CORE' | 'SWITCHING' | 'BOTH';
}

export interface SettlementData {
  rrn: string;
  reff: string;
  status: string;
  merchant_pan: string;
  settlement_amount: string;
  interchange_fee: string;
  convenience_fee: string;
  match_status: 'MATCH' | 'ONLY_IN_CORE' | 'ONLY_IN_SWITCHING';
  source: 'CORE' | 'SWITCHING' | 'BOTH';
}

export interface UploadFiles {
  coreFiles: File | File[];
  altoReconFiles?: File | File[];
  altoSettlementFiles?: File | File[];
  jalinReconFiles?: File | File[];
  jalinSettlementFiles?: File | File[];
  ajReconFiles?: File | File[];
  ajSettlementFiles?: File | File[];
  rintiReconFiles?: File | File[];
  rintiSettlementFiles?: File | File[];
}
