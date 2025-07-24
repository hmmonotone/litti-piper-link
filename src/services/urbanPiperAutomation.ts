
import { Transaction } from '../types/transaction';

export interface AutomationConfig {
  portalUrl: string;
  username: string;
  password: string;
  headless?: boolean;
  timeout?: number;
  serverUrl?: string; // Backend server URL
}

export interface AutomationResult {
  success: boolean;
  orderId?: string;
  error?: string;
  screenshot?: string;
}

export class UrbanPiperAutomation {
  private config: AutomationConfig;

  constructor(config: AutomationConfig) {
    this.config = {
      headless: true,
      timeout: 30000,
      serverUrl: '/api/automation', // Default backend endpoint
      ...config
    };
  }

  async createOrder(transaction: Transaction): Promise<AutomationResult> {
    console.log('Creating order via backend automation service for transaction:', transaction.id);
    
    try {
      const response = await fetch(this.config.serverUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createOrder',
          transaction,
          config: {
            portalUrl: this.config.portalUrl,
            username: this.config.username,
            password: this.config.password,
            headless: this.config.headless,
            timeout: this.config.timeout
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error calling automation service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to automation service'
      };
    }
  }

  async createOrderBatch(transactions: Transaction[]): Promise<AutomationResult[]> {
    console.log('Creating batch orders via backend automation service');
    
    try {
      const response = await fetch(this.config.serverUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createOrderBatch',
          transactions,
          config: {
            portalUrl: this.config.portalUrl,
            username: this.config.username,
            password: this.config.password,
            headless: this.config.headless,
            timeout: this.config.timeout
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const results = await response.json();
      return results;

    } catch (error) {
      console.error('Error calling batch automation service:', error);
      return transactions.map(t => ({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to automation service'
      }));
    }
  }
}

// Default automation service instance
export const urbanPiperAutomation = new UrbanPiperAutomation({
  portalUrl: 'https://prime.urbanpiper.com',
  username: '',
  password: '',
  headless: true,
  serverUrl: '/api/automation'
});
