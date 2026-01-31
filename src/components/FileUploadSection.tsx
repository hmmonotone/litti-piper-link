
import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2, Filter, Plus, X } from 'lucide-react';
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
  const [keyword, setKeyword] = useState<string>('dlittic');
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>('');

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactions = await processExcelFile(file, startDate, endDate, keyword);
      onFileProcessed(transactions);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed, setIsProcessing, startDate, endDate, keyword]);

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !customKeywords.includes(newKeyword.trim()) && !['dlittic', 'dLITTIc', 'swiggy', 'zomato', 'uber'].includes(newKeyword.trim())) {
      setCustomKeywords([...customKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setCustomKeywords(customKeywords.filter(k => k !== keywordToRemove));
    if (keyword === keywordToRemove) {
      setKeyword('dlittic');
    }
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
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          Keyword Filter
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Filter transactions ending with specific keyword
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Keyword
            </label>
            <select
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="dlittic">dlittic</option>
              <option value="dLITTIc">dLITTIc</option>
              <option value="swiggy">swiggy</option>
              <option value="zomato">zomato</option>
              <option value="uber">uber</option>
              {customKeywords.map((customKeyword) => (
                <option key={customKeyword} value={customKeyword}>
                  {customKeyword}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Custom Keyword
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter new keyword"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <button
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          {customKeywords.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Keywords
              </label>
              <div className="flex flex-wrap gap-2">
                {customKeywords.map((customKeyword) => (
                  <div
                    key={customKeyword}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    <span>{customKeyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(customKeyword)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Currently filtering for transactions ending with: <span className="font-semibold text-blue-600">{keyword}</span>
          </p>
        </div>
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
