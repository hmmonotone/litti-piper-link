
import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Transaction } from '../types/transaction';

interface TransactionTableProps {
  transactions: Transaction[];
  isProcessing: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, isProcessing }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return baseClasses;
    }
  };

  if (isProcessing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions processed yet</h3>
          <p className="text-gray-500">Upload a bank statement to see processed transactions here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Processed Transactions</h3>
        <span className="text-sm text-gray-500">
          {transactions.length} transactions
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Full</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Half</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Water</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Packing</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.date}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {transaction.details}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ₹{transaction.paidAmount.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {transaction.fullPlate}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {transaction.halfPlate}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {transaction.water}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {transaction.packing}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ₹{transaction.expectedCost.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                  <span className={transaction.adjustment > 0 ? 'text-green-600' : transaction.adjustment < 0 ? 'text-red-600' : 'text-gray-900'}>
                    {transaction.adjustment > 0 ? '+' : ''}₹{transaction.adjustment.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    {getStatusIcon(transaction.status)}
                    <span className={getStatusBadge(transaction.status)}>
                      {transaction.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
