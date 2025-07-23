
export interface Transaction {
  id: string;
  date: string;
  valueDate: string;
  details: string;
  paidAmount: number;
  fullPlate: number;
  halfPlate: number;
  water: number;
  packing: number;
  expectedCost: number;
  adjustment: number;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface ProcessingStats {
  total: number;
  processed: number;
  failed: number;
  adjustments: number;
}
