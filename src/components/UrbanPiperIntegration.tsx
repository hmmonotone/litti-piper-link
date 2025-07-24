
import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { urbanPiperService } from '../services/urbanPiperService';
import { useToast } from '../hooks/use-toast';
import CorsNotice from './CorsNotice';

interface UrbanPiperIntegrationProps {
  transactions: Transaction[];
  onOrderCreated?: (transactionId: string, orderId: string) => void;
}

interface OrderStatus {
  transactionId: string;
  status: 'pending' | 'creating' | 'success' | 'error';
  orderId?: string;
  error?: string;
}

const UrbanPiperIntegration: React.FC<UrbanPiperIntegrationProps> = ({
  transactions,
  onOrderCreated
}) => {
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createSingleOrder = async (transaction: Transaction) => {
    setOrderStatuses(prev => [...prev.filter(s => s.transactionId !== transaction.id), {
      transactionId: transaction.id,
      status: 'creating'
    }]);

    try {
      const { createResponse, settleResponse } = await urbanPiperService.createAndSettleOrder(transaction);
      
      setOrderStatuses(prev => [...prev.filter(s => s.transactionId !== transaction.id), {
        transactionId: transaction.id,
        status: 'success',
        orderId: createResponse._id
      }]);

      onOrderCreated?.(transaction.id, createResponse._id);
      
      toast({
        title: "Order Created Successfully",
        description: `Order ${createResponse._id} created and settled for ₹${transaction.paidAmount}`,
      });

    } catch (error) {
      console.error('Error creating order:', error);
      
      setOrderStatuses(prev => [...prev.filter(s => s.transactionId !== transaction.id), {
        transactionId: transaction.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);

      toast({
        title: "Order Creation Failed",
        description: error instanceof Error ? error.message : 'Failed to create order',
        variant: "destructive"
      });
    }
  };

  const createAllOrders = async () => {
    setIsProcessing(true);
    
    try {
      for (const transaction of transactions) {
        await createSingleOrder(transaction);
        // Add a small delay between orders to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Bulk Order Creation Complete",
        description: `Processed ${transactions.length} transactions`,
      });
      
    } catch (error) {
      console.error('Error in bulk order creation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getOrderStatus = (transactionId: string) => {
    return orderStatuses.find(s => s.transactionId === transactionId);
  };

  const getStatusIcon = (status: OrderStatus['status']) => {
    switch (status) {
      case 'creating':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: OrderStatus['status']) => {
    switch (status) {
      case 'creating':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions to process</h3>
          <p className="text-gray-500">Upload a bank statement to create Urban Piper orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <CorsNotice />
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Send className="h-6 w-6 text-blue-600" />
          Urban Piper Integration
        </h3>
        <button
          onClick={createAllOrders}
          disabled={isProcessing}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Create All Orders
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => {
          const status = getOrderStatus(transaction.id);
          
          return (
            <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.date}
                    </span>
                    <span className="text-sm text-gray-500">
                      ₹{transaction.paidAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Full: {transaction.fullPlate}</span>
                    <span>Half: {transaction.halfPlate}</span>
                    <span>Water: {transaction.water}</span>
                    <span>Packing: {transaction.packing}</span>
                  </div>
                  
                  {status && (
                    <div className={`mt-2 text-sm ${getStatusColor(status.status)}`}>
                      {status.status === 'success' && status.orderId && (
                        <span>Order created: {status.orderId}</span>
                      )}
                      {status.status === 'error' && status.error && (
                        <span>Error: {status.error}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {status && getStatusIcon(status.status)}
                  
                  <button
                    onClick={() => createSingleOrder(transaction)}
                    disabled={status?.status === 'creating' || isProcessing}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {status?.status === 'creating' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Create Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UrbanPiperIntegration;
