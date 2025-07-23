
import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { processExcelFile } from '../utils/excelProcessor';
import DateRangeFilter from './DateRangeFilter';

interface FileUploadSectionProps {
  onFileProcessed: (transactions: Transaction[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFileProcessed,
  isProcessing,
  setIsProcessing
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactions = await processExcelFile(file, startDate, endDate);
      onFileProcessed(transactions);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed, setIsProcessing, startDate, endDate]);

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Date Range Filter</h3>
        <p className="text-sm text-gray-600 mb-4">
          Set a date range to process only transactions within this period
        </p>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClear={handleClearFilter}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Upload Bank Statement
        </h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-gray-600">Processing bank statement...</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Select IDFC First Bank Excel statement
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Choose File
              </label>
            </>
          )}
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">Supported formats: .xlsx, .xls</p>
          <p>The system will process credit transactions only</p>
          {(startDate || endDate) && (
            <p className="mt-2 text-blue-600">
              Date filter active: {startDate ? `From ${startDate.toLocaleDateString()}` : ''} 
              {startDate && endDate ? ' ' : ''}
              {endDate ? `To ${endDate.toLocaleDateString()}` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadSection;
