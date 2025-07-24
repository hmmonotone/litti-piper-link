import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, Settings, Eye } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { urbanPiperAutomation, AutomationConfig, AutomationResult } from '../services/urbanPiperAutomation';
import { useToast } from '../hooks/use-toast';
import CorsNotice from './CorsNotice';
import BrowserLimitationNotice from './BrowserLimitationNotice';

interface UrbanPiperIntegrationProps {
  transactions: Transaction[];
  onOrderCreated?: (transactionId: string, orderId: string) => void;
}

interface OrderStatus {
  transactionId: string;
  status: 'pending' | 'creating' | 'success' | 'error';
  orderId?: string;
  error?: string;
  screenshot?: string;
}

interface AutomationSettings {
  portalUrl: string;
  username: string;
  password: string;
  headless: boolean;
}

const UrbanPiperIntegration: React.FC<UrbanPiperIntegrationProps> = ({
  transactions,
  onOrderCreated
}) => {
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AutomationSettings>({
    portalUrl: 'https://prime.urbanpiper.com',
    username: '',
    password: '',
    headless: true
  });
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const { toast } = useToast();

  const updateAutomationConfig = () => {
    const config: AutomationConfig = {
      portalUrl: settings.portalUrl,
      username: settings.username,
      password: settings.password,
      headless: settings.headless
    };
    
    // Update the automation service configuration
    Object.assign(urbanPiperAutomation, new (urbanPiperAutomation.constructor as any)(config));
  };

  const createSingleOrder = async (transaction: Transaction) => {
    if (!settings.username || !settings.password) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Urban Piper credentials first",
        variant: "destructive"
      });
      return;
    }

    setOrderStatuses(prev => [...prev.filter(s => s.transactionId !== transaction.id), {
      transactionId: transaction.id,
      status: 'creating'
    }]);

    try {
      updateAutomationConfig();
      
      const result: AutomationResult = await urbanPiperAutomation.createOrder(transaction);
      
      if (result.success) {
        setOrderStatuses(prev => [...prev.filter(s => s.transactionId !== transaction.id), {
          transactionId: transaction.id,
          status: 'success',
          orderId: result.orderId,
          screenshot: result.screenshot
        }]);

        onOrderCreated?.(transaction.id, result.orderId || '');
        
        toast({
          title: "Order Created Successfully",
          description: `Order ${result.orderId} created for ₹${transaction.paidAmount}`,
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }

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
    if (!settings.username || !settings.password) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Urban Piper credentials first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      updateAutomationConfig();
      
      for (const transaction of transactions) {
        await createSingleOrder(transaction);
        // Add delay between orders to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Send className="h-6 w-6 text-blue-600" />
          Urban Piper Automation
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={createAllOrders}
            disabled={isProcessing || !settings.username || !settings.password}
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
      </div>

      <BrowserLimitationNotice />

      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-4">Automation Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portal URL</label>
              <input
                type="url"
                value={settings.portalUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, portalUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://prime.urbanpiper.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={settings.username}
                onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Your Urban Piper username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={settings.password}
                onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Your Urban Piper password"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="headless"
                checked={settings.headless}
                onChange={(e) => setSettings(prev => ({ ...prev, headless: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="headless" className="text-sm font-medium text-gray-700">
                Run in headless mode (background)
              </label>
            </div>
          </div>
        </div>
      )}

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
                  
                  {status?.screenshot && (
                    <button
                      onClick={() => setSelectedScreenshot(status.screenshot!)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View screenshot"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => createSingleOrder(transaction)}
                    disabled={status?.status === 'creating' || isProcessing || !settings.username || !settings.password}
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

      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Screenshot</h3>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <img
              src={`data:image/png;base64,${selectedScreenshot}`}
              alt="Order screenshot"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UrbanPiperIntegration;
