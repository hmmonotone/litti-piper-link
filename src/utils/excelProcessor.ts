
import { Transaction } from '../types/transaction';

// Menu prices
const MENU_PRICES = {
  fullPlate: 89,
  halfPlate: 49,
  water: 10,
  packing: 5
};

export const processExcelFile = async (file: File): Promise<Transaction[]> => {
  // For demo purposes, we'll simulate processing an Excel file
  // In a real implementation, you'd use a library like xlsx to parse the file
  
  // Simulate some sample transactions
  const sampleTransactions = [
    {
      date: '2024-01-15',
      valueDate: '2024-01-15',
      details: 'UPI Payment from John Doe',
      paidAmount: 180,
      fullPlate: 2,
      halfPlate: 0,
      water: 0,
      packing: 2
    },
    {
      date: '2024-01-16',
      valueDate: '2024-01-16',
      details: 'Cash Payment - Office Order',
      paidAmount: 250,
      fullPlate: 1,
      halfPlate: 3,
      water: 5,
      packing: 1
    },
    {
      date: '2024-01-17',
      valueDate: '2024-01-17',
      details: 'Online Transfer - Bulk Order',
      paidAmount: 500,
      fullPlate: 4,
      halfPlate: 2,
      water: 8,
      packing: 6
    }
  ];

  return sampleTransactions.map((transaction, index) => {
    const expectedCost = calculateExpectedCost(transaction);
    const adjustment = calculateAdjustment(transaction.paidAmount, expectedCost);
    
    return {
      id: `txn-${index + 1}`,
      ...transaction,
      expectedCost,
      adjustment,
      status: Math.random() > 0.1 ? 'success' : 'failed' as 'success' | 'failed'
    };
  });
};

const calculateExpectedCost = (transaction: any): number => {
  return (
    transaction.fullPlate * MENU_PRICES.fullPlate +
    transaction.halfPlate * MENU_PRICES.halfPlate +
    transaction.water * MENU_PRICES.water +
    transaction.packing * MENU_PRICES.packing
  );
};

const calculateAdjustment = (paidAmount: number, expectedCost: number): number => {
  const difference = paidAmount - expectedCost;
  
  if (difference <= 10 && difference > 0) {
    // Straight rounding for small overpayments
    return difference;
  } else if (difference > 10) {
    // For larger overpayments, calculate extra water
    const remainder = difference % 10;
    return remainder;
  }
  
  // For exact payments or underpayments
  return difference;
};

export const processRealExcelFile = async (file: File): Promise<Transaction[]> => {
  // This would be the actual implementation using xlsx library
  // For now, return the sample data
  return processExcelFile(file);
};
