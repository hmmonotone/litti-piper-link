
import React from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Calculator } from 'lucide-react';
import { ProcessingStats } from '../types/transaction';

interface SalesSummaryProps {
  stats: ProcessingStats;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ stats }) => {
  if (stats.total === 0) {
    return null;
  }

  const totalItems = (stats.totalFullPlate || 0) + (stats.totalHalfPlate || 0) + (stats.totalWater || 0) + (stats.totalPacking || 0);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-blue-200">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-800">
        <TrendingUp className="h-6 w-6" />
        Overall Sales Summary
      </h2>
      
      {/* Main Revenue Card */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">₹{stats.totalPaidAmount?.toFixed(2) || '0.00'}</p>
          </div>
          <DollarSign className="h-12 w-12 text-green-500 opacity-20" />
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Full Plates</span>
          </div>
          <p className="text-lg font-semibold text-gray-800">{stats.totalFullPlate || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Half Plates</span>
          </div>
          <p className="text-lg font-semibold text-gray-800">{stats.totalHalfPlate || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Water</span>
          </div>
          <p className="text-lg font-semibold text-gray-800">{stats.totalWater || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Packing</span>
          </div>
          <p className="text-lg font-semibold text-gray-800">{stats.totalPacking || 0}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Financial Summary</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Expected Revenue:</span>
            <span className="font-medium">₹{stats.totalExpectedCost?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Net Adjustment:</span>
            <span className={`font-medium ${(stats.totalAdjustment || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats.totalAdjustment || 0) >= 0 ? '+' : ''}₹{stats.totalAdjustment?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600">Total Items Sold:</span>
            <span className="font-medium text-blue-600">{totalItems}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;
