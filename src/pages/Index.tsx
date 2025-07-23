
import React, { useState } from 'react';
import { Upload, FileText, TrendingUp, AlertCircle, Download, CheckCircle } from 'lucide-react';
import FileUploadSection from '../components/FileUploadSection';
import TransactionTable from '../components/TransactionTable';
import ProcessingStats from '../components/ProcessingStats';
import { Transaction } from '../types/transaction';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    processed: 0,
    failed: 0,
    adjustments: 0
  });

  const handleFileProcessed = (processedTransactions: Transaction[]) => {
    setTransactions(processedTransactions);
    
    // Calculate stats
    const stats = processedTransactions.reduce((acc, t) => {
      acc.total++;
      if (t.status === 'success') acc.processed++;
      if (t.status === 'failed') acc.failed++;
      if (t.adjustment !== 0) acc.adjustments++;
      return acc;
    }, { total: 0, processed: 0, failed: 0, adjustments: 0 });
    
    setProcessingStats(stats);
  };

  const handleDownloadReport = () => {
    const csvContent = [
      ['Date', 'Details', 'Paid Amount', 'Full Plate', 'Half Plate', 'Water', 'Packing', 'Expected Cost', 'Adjustment', 'Status'],
      ...transactions.map(t => [
        t.date,
        t.details,
        t.paidAmount,
        t.fullPlate,
        t.halfPlate,
        t.water,
        t.packing,
        t.expectedCost,
        t.adjustment,
        t.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bank Statement to Urban Piper
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automated order processing system for IDFC First Bank statements
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <FileUploadSection 
              onFileProcessed={handleFileProcessed}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
            
            <ProcessingStats stats={processingStats} />
            
            {transactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Export Reports
                </h3>
                <button
                  onClick={handleDownloadReport}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Report
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Transaction Table */}
          <div className="lg:col-span-2">
            <TransactionTable 
              transactions={transactions}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
