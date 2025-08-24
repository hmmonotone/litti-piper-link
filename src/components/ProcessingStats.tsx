
import React from 'react';
import { CheckCircle, AlertCircle, TrendingUp, DollarSign, Receipt } from 'lucide-react';
import { ProcessingStats as StatsType } from '../types/transaction';

interface ProcessingStatsProps {
  stats: StatsType;
}

const ProcessingStats: React.FC<ProcessingStatsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Transactions',
      value: stats.total,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Successfully Processed',
      value: stats.processed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'With Adjustments',
      value: stats.adjustments,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Processing Statistics</h3>
      
      <div className="space-y-4">
        {statItems.map((stat, index) => (
          <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${stat.bgColor}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div className="flex-1">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary Section */}
      {stats.total > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-gray-600" />
            Total Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount Received</span>
              <span className="text-md font-semibold text-green-600">₹{stats.totalPaidAmount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Expected Cost</span>
              <span className="text-md font-semibold text-blue-600">₹{stats.totalExpectedCost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm text-gray-600">Net Adjustment</span>
              <span className={`text-md font-semibold ${(stats.totalAdjustment || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats.totalAdjustment || 0) >= 0 ? '+' : ''}₹{stats.totalAdjustment?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingStats;
